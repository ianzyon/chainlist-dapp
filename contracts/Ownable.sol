pragma solidity ^0.4.18;

contract Ownable {
    // state variables
    address owner;

    // modifiers
    modifier onlyOwner() {
        require(msg.sender == owner);
        _; // placeholder the represent the code of the function wich the modifier is applyed to
    
    }

    // constructor
    function Ownable() public {
        owner = msg.sender;
    }



}