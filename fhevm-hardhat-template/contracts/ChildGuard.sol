// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {FHE, euint32, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title ChildGuard – 儿童保护行动存证（FHE 增强）
/// @notice 使用 FHE 对支持计数进行加密存储，公开查询返回密文句柄，解密须经授权
contract ChildGuard is SepoliaConfig {
    struct ActionRecord {
        uint256 id;
        address submitter;
        string title;
        string descriptionHash; // IPFS CID（加密后）
        string region;
        string date;
        uint256 timestamp;
        euint32 supportCountEnc; // 加密的支持计数
    }

    mapping(uint256 => ActionRecord) public records;
    mapping(uint256 => mapping(address => bool)) public supported; // 点赞去重
    // 统计
    uint256 public totalSupports;
    mapping(bytes32 => uint256) public regionCounts; // 地区 -> 提交数量
    mapping(address => uint256) public submitCount; // 用户提交次数
    mapping(address => uint256) public supportGivenCount; // 用户点赞次数
    mapping(address => uint256) public supportReceivedCount; // 用户被点赞次数（其记录收到的总点赞）
    // 节流/风控
    uint256 public constant SUBMIT_COOLDOWN = 10 minutes;
    uint256 public constant SUPPORT_DAILY_LIMIT = 50;
    mapping(address => uint256) public lastSubmitAt;
    mapping(address => mapping(uint256 => uint256)) public supportsPerDay; // user => day => count
    // 勋章
    address public badgeContract; // GuardBadge 合约地址（可选）
    mapping(uint256 => mapping(address => bool)) public badgeClaimed; // badgeId => user => claimed

    // 勋章阈值
    uint256 public constant BADGE1_TARGET = 1; // 首次提交
    uint256 public constant BADGE2_TARGET = 10; // 收到10次支持
    uint256 public constant BADGE3_TARGET = 10; // 点赞10次
    uint256 public totalRecords;

    event ActionSubmitted(address indexed submitter, uint256 indexed id);
    event ActionSupported(uint256 indexed id, address indexed supporter);
    event BadgeMintRequested(address indexed to, uint256 indexed badgeId);
    event BadgeClaimed(address indexed to, uint256 indexed badgeId);

    /// @notice 提交行动（支持计数初始化为 0 的密文）
    function submitAction(
        string memory title,
        string memory descriptionHash,
        string memory region,
        string memory date
    ) external {
        // 冷却
        require(block.timestamp - lastSubmitAt[msg.sender] >= SUBMIT_COOLDOWN, "submit cooldown");
        lastSubmitAt[msg.sender] = block.timestamp;
        uint256 id = ++totalRecords;

        // 初始化密文 0
        euint32 zero = FHE.asEuint32(0);

        records[id] = ActionRecord({
            id: id,
            submitter: msg.sender,
            title: title,
            descriptionHash: descriptionHash,
            region: region,
            date: date,
            timestamp: block.timestamp,
            supportCountEnc: zero
        });

        // 授权本合约与提交者可读取密文（方便后续授权扩展）
        FHE.allowThis(records[id].supportCountEnc);
        FHE.allow(records[id].supportCountEnc, msg.sender);

        emit ActionSubmitted(msg.sender, id);

        // 统计
        regionCounts[keccak256(bytes(region))] += 1;
        submitCount[msg.sender] += 1;

        // 勋章：首次提交
        if (badgeContract != address(0)) {
            // 由前端或运营手动监听事件后铸造；或这里直接发事件请求
            emit BadgeMintRequested(msg.sender, 1);
        }
    }

    /// @notice 点赞支持（每地址对同一 id 仅一次），传入加密增量（通常为 1）
    /// @param recordId 记录 id
    /// @param incEnc 外部加密增量（e.g. 1）
    /// @param inputProof 输入证明
    function supportAction(
        uint256 recordId,
        externalEuint32 incEnc,
        bytes calldata inputProof
    ) external {
        ActionRecord storage r = records[recordId];
        require(r.submitter != address(0), "Record not found");
        require(!supported[recordId][msg.sender], "Already supported");

        // 每日上限
        uint256 day = block.timestamp / 1 days;
        require(supportsPerDay[msg.sender][day] < SUPPORT_DAILY_LIMIT, "daily support limit");

        // 解封外部密文
        euint32 inc = FHE.fromExternal(incEnc, inputProof);

        // 计数 += inc
        r.supportCountEnc = FHE.add(r.supportCountEnc, inc);

        // 允许本合约与提交者、点赞者读取最新计数（可按需放开）
        FHE.allowThis(r.supportCountEnc);
        FHE.allow(r.supportCountEnc, r.submitter);
        FHE.allow(r.supportCountEnc, msg.sender);

        supported[recordId][msg.sender] = true;
        supportsPerDay[msg.sender][day] += 1;
        totalSupports += 1;
        supportGivenCount[msg.sender] += 1;
        supportReceivedCount[r.submitter] += 1;
        emit ActionSupported(recordId, msg.sender);
    }

    /// @notice 获取单条记录（包含密文支持计数句柄）
    function getAction(uint256 recordId)
        external
        view
        returns (
            ActionRecord memory
        )
    {
        require(records[recordId].submitter != address(0), "Record not found");
        return records[recordId];
    }

    /// @notice 获取一页记录（分页，避免 getAllActions 过大）
    function getActions(uint256 offset, uint256 limit)
        external
        view
        returns (ActionRecord[] memory)
    {
        if (offset >= totalRecords) return new ActionRecord[](0);
        uint256 end = offset + limit;
        if (end > totalRecords) end = totalRecords;
        uint256 n = end - offset;
        ActionRecord[] memory page = new ActionRecord[](n);
        for (uint256 i = 0; i < n; i++) {
            page[i] = records[offset + 1 + i];
        }
        return page;
    }

    function setBadgeContract(address c) external {
        // 简化：部署者即 msg.sender，在生产可加 Ownable
        require(badgeContract == address(0) || msg.sender == tx.origin, "for demo");
        badgeContract = c;
    }

    function isEligible(address user, uint256 badgeId) public view returns (bool eligible, uint256 progress, uint256 target) {
        if (badgeId == 1) {
            progress = submitCount[user];
            target = BADGE1_TARGET;
            eligible = progress >= target;
        } else if (badgeId == 2) {
            progress = supportReceivedCount[user];
            target = BADGE2_TARGET;
            eligible = progress >= target;
        } else if (badgeId == 3) {
            progress = supportGivenCount[user];
            target = BADGE3_TARGET;
            eligible = progress >= target;
        }
    }

    function claimBadge(uint256 badgeId) external {
        require(badgeContract != address(0), "badge not set");
        require(!badgeClaimed[badgeId][msg.sender], "already claimed");
        (bool ok,,) = isEligible(msg.sender, badgeId);
        require(ok, "not eligible");
        // mint 1 badge
        (bool success, ) = badgeContract.call(abi.encodeWithSignature("mint(address,uint256,uint256)", msg.sender, badgeId, 1));
        require(success, "mint failed");
        badgeClaimed[badgeId][msg.sender] = true;
        emit BadgeClaimed(msg.sender, badgeId);
    }
}


