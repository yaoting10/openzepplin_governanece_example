// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/access/Ownable.sol";


contract Box is Ownable{
    uint256 private _value;
    // Emitted when the stored value changes
    event ValueChange(uint256 value);

    // Stores a new value in the contract
    function store(uint256 value) public {
        _value = value;
        emit ValueChange(value);
    }

    function retrieve() public view returns (uint256) {
        return _value;
    }
}