const ChainList = artifacts.require("./ChainList.sol");

// test suite
contract('ChainList', (accounts)=>{
    var chainListInstance;
    const seller = accounts[1]; // primeira conta no nodo
    const buyer = accounts[2]; 
    const articleName1 = "article 1";
    const articleDescription1 = "Description for article 1";
    const articlePrice1 = 1;
    const articleName2 = "article 2";
    const articleDescription2 = "Description for article 2";
    const articlePrice2 = 2;
    let sellerBalanceBefore, sellerBalanceAfter;
    let buyerBalanceBefore, buyerBalanceAfter;


    // testes de estado inicial 
    it("should be initialized with empty values", () => {
        return ChainList.deployed().then((instance) => {
            chainListInstance = instance;
            return instance.getNumberOfArticles()
        }).then((data) => {
            assert.equal(data.toNumber(), 0, "number of articles must be zero");
            return chainListInstance.getArticlesForSale()
        }).then((data)=>{
            assert.equal(data.length, 0 , "There shouldn't be any article for sale");
        });
    });
    // teste da função sellArticle
    // sell a first article
    it("should let us sell a first article", ()=>{
        return ChainList.deployed().then((instance)=>{
            chainListInstance = instance;
            return chainListInstance.sellArticle(articleName1, articleDescription1, web3.toWei(articlePrice1, "ether"), {from: seller});
        }).then((receipt)=>{
            // check event
            assert.equal(receipt.logs.length, 1, "one event should have been triggered");
            assert.equal(receipt.logs[0].event, "LogSellArticle", "event should have be LogSellArticle");
            assert.equal(receipt.logs[0].args._id.toNumber(), 1, "id must be 1");
            assert.equal(receipt.logs[0].args._seller, seller, "event account seller must be " + seller);
            assert.equal(receipt.logs[0].args._name, articleName1, "event name must be " + articleName1);
            assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(articlePrice1, 'ether'), "event name must be " + web3.toWei(articlePrice1, 'ether'));

            return chainListInstance.getNumberOfArticles();
        }).then((data)=>{
            assert.equal(data, 1 , "number of articles must be one");

            return chainListInstance.getArticlesForSale();
        }).then((data)=>{
            assert.equal(data.length, 1, "there must be one article for sale");
            assert.equal(data[0].toNumber(), 1, "article id must be 1");

            return chainListInstance.articles(data[0]);
        }).then((data)=>{
            assert.equal(data[0].toNumber(), 1 , "article id must be 1");
            assert.equal(data[1], seller , "seller must be " + seller);
            assert.equal(data[2], 0x0 , "buyer must be empty");
            assert.equal(data[3], articleName1 , "article name must be " + articleName1);
            assert.equal(data[4], articleDescription1 , "article description must be " + articleDescription1);
            assert.equal(data[5].toNumber(), web3.toWei(articlePrice1, "ether") , "article price must be " + web3.toWei(articlePrice1, "ether"));
        });
    });
    // sell a second article
    it("should let us sell a second article", ()=>{
        return ChainList.deployed().then((instance)=>{
            chainListInstance = instance;
            return chainListInstance.sellArticle(articleName2, articleDescription2, web3.toWei(articlePrice2, "ether"), {from: seller});
        }).then((receipt)=>{
            // check event
            assert.equal(receipt.logs.length, 1, "one event should have been triggered");
            assert.equal(receipt.logs[0].event, "LogSellArticle", "event should have be LogSellArticle");
            assert.equal(receipt.logs[0].args._id.toNumber(), 2, "id must be 2");
            assert.equal(receipt.logs[0].args._seller, seller, "event account seller must be " + seller);
            assert.equal(receipt.logs[0].args._name, articleName2, "event name must be " + articleName2);
            assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(articlePrice2, 'ether'), "event name must be " + web3.toWei(articlePrice2, 'ether'));

            return chainListInstance.getNumberOfArticles();
        }).then((data)=>{
            assert.equal(data, 2 , "number of articles must be two");

            return chainListInstance.getArticlesForSale();
        }).then((data)=>{
            assert.equal(data.length, 2, "there must be two articles for sale");
            assert.equal(data[0].toNumber(), 1, "article id must be 1");
            assert.equal(data[1].toNumber(), 2, "article id must be 2");

            return chainListInstance.articles(data[1]);
        }).then((data)=>{
            assert.equal(data[0].toNumber(), 2 , "article id must be 2");
            assert.equal(data[1], seller , "seller must be " + seller);
            assert.equal(data[2], 0x0 , "buyer must be empty");
            assert.equal(data[3], articleName2 , "article name must be " + articleName2);
            assert.equal(data[4], articleDescription2 , "article description must be " + articleDescription2);
            assert.equal(data[5].toNumber(), web3.toWei(articlePrice2, "ether") , "article price must be " + web3.toWei(articlePrice2, "ether"));
        });
    });
    // teste de buyArticle
    it('should buy an article', () => {
        return ChainList.deployed().then((instance)=>{
            chainListInstance = instance;
            // record balances of seller and buyer before the buy
            sellerBalanceBefore = web3.fromWei(web3.eth.getBalance(seller), "ether").toNumber();
            buyerBalanceBefore = web3.fromWei(web3.eth.getBalance(buyer), "ether").toNumber();

            return chainListInstance.buyArticle(1, {from: buyer, value: web3.toWei(articlePrice1, "ether")})
            .then((receipt)=>{
                assert.equal(receipt.logs.length, 1, "one event should have been triggered");
                assert.equal(receipt.logs[0].event, "LogBuyArticle", "event should have be LogBuyArticle");
                assert.equal(receipt.logs[0].args._id.toNumber(), 1, "article id must be 1");
                assert.equal(receipt.logs[0].args._seller, seller, "event account seller must be " + seller);
                assert.equal(receipt.logs[0].args._buyer, buyer, "event account buyer must be " + buyer);
                assert.equal(receipt.logs[0].args._name, articleName1, "event name must be " + articleName1);
                assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(articlePrice1, 'ether'), "event name must be " + web3.toWei(articlePrice1, 'ether'));
                // balances after the buy
                sellerBalanceAfter = web3.fromWei(web3.eth.getBalance(seller), "ether").toNumber();
                buyerBalanceAfter = web3.fromWei(web3.eth.getBalance(buyer), "ether").toNumber();

                // check the effect of buy on the balances of buyer and seller, accounting for gas
                assert(sellerBalanceAfter == sellerBalanceBefore + articlePrice1, "seller should have earned " + articlePrice1 + " ETH");
                assert(buyerBalanceAfter <= buyerBalanceBefore - articlePrice1, "buyer should have spent " + articlePrice1 + " ETH");

                return chainListInstance.getArticlesForSale();
            }).then((data)=>{
                assert.equal(data.length, 1, "there should now be only 1 article left for sale");
                assert.equal(data[0].toNumber(), 2, "article 2 should be the only article left for sale");

                return chainListInstance.getNumberOfArticles();
            }).then((data)=>{
                assert.equal(data.toNumber(), 2 , "there should be 2 articles in total");
            });
        });
    });
});