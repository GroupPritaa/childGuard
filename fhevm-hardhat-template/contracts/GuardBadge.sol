// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract GuardBadge is ERC1155, Ownable {
    // Badge IDs
    uint256 public constant BADGE_FIRST_SUBMIT = 1; // 首次提交
    uint256 public constant BADGE_TOP_SUPPORT = 2;  // 高赞记录
    uint256 public constant BADGE_ACTIVE_HELPER = 3; // 活跃志愿者

    constructor(string memory uri_) ERC1155(uri_) Ownable(msg.sender) {}

    function mint(address to, uint256 id, uint256 amount) external onlyOwner {
        _mint(to, id, amount, "");
    }

    function mintBatch(
        address to,
        uint256[] calldata ids,
        uint256[] calldata amounts
    ) external onlyOwner {
        _mintBatch(to, ids, amounts, "");
    }
}




