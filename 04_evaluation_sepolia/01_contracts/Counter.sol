// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract Counter {
    uint256 public count;
    address private owner; 

    modifier onlyowner (){
        require(msg.sender == owner, "Only call owner");
        _;
    }

    constructor(address _owner){
        count = 0;
        owner = _owner;
    }

    function increment() public{
        count += 1;
    }

    function getCount() public view returns (uint256){
        return count;
    }

    function reset() public onlyowner() {
        count = 0;
    }
}