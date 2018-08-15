// contract to be tested
const ChainList = artifacts.require("./ChainList.sol");

// test suite

contract("ChainList", (accounts) => { 
    let chailListInstance;
    const seller = accounts[1];
    const buyer = accounts[2];
    const articleName = "article 1";
    const articleDescription = "Description for article 1";
    const articlePrice = 1;

    // no article for sale yet
    it("should throw an exception if you try to buy an article when theres in no article for sale yet", ()=>{
        return ChainList.deployed().then((instance)=>{
            chailListInstance = instance;
            return chailListInstance.buyArticle(1, {from: buyer, value: web3.toWei(articlePrice, "ether")});
        }).then(assert.fail)
        .catch((error)=>{
            assert(true);
        }).then(()=>{
            return chailListInstance.getNumberOfArticles();
        }).then((data)=>{
            assert.equal(data.toNumber(), 0, "number of articles must be 0");
            
        });
    });
    // buying an article that does not exist
    it('should throw an exception if you try to buy an article that does not exist', ()=>{
        return ChainList.deployed().then((instance)=>{
            chailListInstance = instance;
            return chailListInstance.sellArticle(articleName, articleDescription, web3.toWei(articlePrice, "ether"), { from: seller });

        }).then((receipt)=>{
            return chailListInstance.buyArticle(2, { from: seller, value: web3.toWei(articlePrice, "ether")})
        }).then(assert.fail)
        .catch((error) => {
            assert(true);
        }).then(()=>{
            return chailListInstance.articles(1);
        }).then((data)=>{
            assert.equal(data[0].toNumber(), 1, "article id must be 1");
            assert.equal(data[1], seller , "seller must be " + seller);
            assert.equal(data[2], 0x0 , "buyer must be empty");
            assert.equal(data[3], articleName , "article name must be " + articleName);
            assert.equal(data[4], articleDescription , "article description must be " + articleDescription);
            assert.equal(data[5].toNumber(), web3.toWei(articlePrice, "ether") , "article price must be " + web3.toWei(articlePrice, "ether"));
        
        });
    });
    // buying an article you are selling
    it("should throw an exception if you to buy your own article", ()=>{
        return ChainList.deployed().then((instance)=>{
            chailListInstance = instance;
 
            return chailListInstance.buyArticle(1, {from: seller, value: web3.toWei(articlePrice, "ether")});
        }).then(assert.fail)
        .catch((error)=>{
            assert(true);
        }).then(()=>{
            return chailListInstance.articles(1);
        }).then((data)=>{
            assert.equal(data[0].toNumber(), 1, "id must be 1");
            assert.equal(data[1], seller, "seller must be " + seller);
            assert.equal(data[2], 0x0, "buyer must be empty");
            assert.equal(data[3], articleName, "article name must be " + articleName);
            assert.equal(data[4], articleDescription, "article description must be " + articleDescription);
            assert.equal(data[5].toNumber(), web3.toWei(articlePrice, "ether"), "article price must be " + articlePrice + " ETH");
        });
        
    });
    // buying with incorrect value
    it("should throw an exception if you try to buy an article for a different value from its price", ()=>{
        return ChainList.deployed().then((instance)=>{
            chailListInstance = instance;
            return chailListInstance.buyArticle(1,{from: buyer, value: web3.toWei(articlePrice + 1, "ether")});
        }).then(assert.fail)
        .catch((error)=>{
            assert(true);
        }).then(()=>{
            return chailListInstance.articles(1);
        }).then((data)=>{
            assert.equal(data[0].toNumber(), 1, "id must be 1");
            assert.equal(data[1], seller, "seller must be " + seller);
            assert.equal(data[2], 0x0, "buyer must be empty");
            assert.equal(data[3], articleName, "article name must be " + articleName);
            assert.equal(data[4], articleDescription, "article description must be " + articleDescription);
            assert.equal(data[5].toNumber(), web3.toWei(articlePrice, "ether"), "article price must be " + articlePrice + " ETH");
        });
        
    });
    // trying to buy an article that has already being sold
    it("should throw an exception if you try to buy an article that has already been sold", ()=>{
        return ChainList.deployed().then((instance)=>{
            chailListInstance = instance;
            return chailListInstance.buyArticle(1,{from: buyer, value: web3.toWei(articlePrice, "ether")});
        }).then(()=>{
            return chailListInstance.buyArticle(1, {from: web3.eth.accounts[0], value: web3.toWei(articlePrice, "ether")});
        })
        .then(assert.fail)
        .catch((error)=>{
            assert(true);
        }).then(()=>{
            return chailListInstance.articles(1);
        }).then((data)=>{
            assert.equal(data[0].toNumber(), 1, "id must be 1");
            assert.equal(data[1], seller, "seller must be " + seller);
            assert.equal(data[2], buyer, "buyer must be empty");
            assert.equal(data[3], articleName, "article name must be " + articleName);
            assert.equal(data[4], articleDescription, "article description must be " + articleDescription);
            assert.equal(data[5].toNumber(), web3.toWei(articlePrice, "ether"), "article price must be " + articlePrice + " ETH");
        });
        
    });
});