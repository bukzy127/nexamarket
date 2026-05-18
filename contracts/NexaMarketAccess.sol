// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract NexaMarketAccess {
    struct Project {
        address payable owner;
        uint256 price;
        string metadataRef;
        uint256 createdAt;
        bool exists;
    }

    mapping(uint256 => Project) public projects;
    mapping(uint256 => mapping(address => bool)) public access;

    event ProjectRegistered(
        uint256 indexed projectId,
        address indexed owner,
        uint256 price,
        string metadataRef
    );
    event ProjectPurchased(
        uint256 indexed projectId,
        address indexed buyer,
        address indexed owner,
        uint256 price
    );
    event PriceUpdated(uint256 indexed projectId, uint256 price);

    error ProjectExists();
    error ProjectNotFound();
    error Unauthorized();
    error IncorrectPayment();
    error OwnerCannotBuyOwnProject();

    function registerProject(
        uint256 projectId,
        uint256 price,
        string calldata metadataRef
    ) external {
        if (projects[projectId].exists) revert ProjectExists();

        projects[projectId] = Project({
            owner: payable(msg.sender),
            price: price,
            metadataRef: metadataRef,
            createdAt: block.timestamp,
            exists: true
        });
        access[projectId][msg.sender] = true;

        emit ProjectRegistered(projectId, msg.sender, price, metadataRef);
    }

    function purchase(uint256 projectId) external payable {
        Project storage project = projects[projectId];
        if (!project.exists) revert ProjectNotFound();
        if (msg.sender == project.owner) revert OwnerCannotBuyOwnProject();
        if (msg.value != project.price) revert IncorrectPayment();

        (bool success, ) = project.owner.call{value: msg.value}("");
        require(success, "Transfer failed");
        access[projectId][msg.sender] = true;

        emit ProjectPurchased(projectId, msg.sender, project.owner, msg.value);
    }

    function updatePrice(uint256 projectId, uint256 price) external {
        Project storage project = projects[projectId];
        if (!project.exists) revert ProjectNotFound();
        if (msg.sender != project.owner) revert Unauthorized();

        project.price = price;
        emit PriceUpdated(projectId, price);
    }

    function hasAccess(
        uint256 projectId,
        address wallet
    ) external view returns (bool) {
        return access[projectId][wallet];
    }
}
