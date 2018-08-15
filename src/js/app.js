App = {
      web3Provider: null,
      contracts: {},
      account: 0x0, 
      loading: false,

     init: function() {
          // load articlesRow example - hardcode
          /*const articlesRow = $('#articlesRow');
          const articleTemplate = $('#articleTemplate');

          articleTemplate.find('.panel-title').text('article 1');
          articleTemplate.find('.article-description').text('Description for article 1');
          articleTemplate.find('.article-price').text('10.23');
          articleTemplate.find('.article-seller').text('0x12344567');

          articlesRow.append(articleTemplate.html()); */


          return App.initWeb3();
     },

     initWeb3: function() {
          // initialize web3
          if(typeof web3 !== 'undefined') {
                // reusa o provedor do objeto web3 injetado pelo metamask se estiver ativo
                App.web3Provider = web3.currentProvider;
          } else { 
                  // cria um novo provedor e pluga diretamento ao currentProvider local
                   App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545'); // ganache
          }
          web3 = new Web3(App.web3Provider);

          App.displayAccountInfo();

          return App.initContract();
     },
     displayAccountInfo: function() {
            web3.eth.getCoinbase((err,account)=>{
                  if(err === null) {
                        App.account = account;
                        $('#account').text(account);
                        web3.eth.getBalance(account, (err, balance)=>{
                              if(err === null){
                                    $('#accountBalance').text(web3.fromWei(balance, 'ether') + " ETH");
                              }
                        });
                  }
            });
     },
     initContract: function() {
           // jQuery ajax
          $.getJSON('ChainList.json', (chainListArtifact)=>{
            // usar o arquivo do artefato para instanciar a abstração do contrato em truffle
            App.contracts.ChainList = TruffleContract(chainListArtifact);
            // setar o provedor para nosso contrato
            App.contracts.ChainList.setProvider(App.web3Provider);
            // call to listen events
            App.ListenToEthEvents();
            // retornar o artigo do contrato
            return App.reloadArticles();
          });
     },
     reloadArticles: function() {
           // avoid reentry
           if(App.loading){
                 return;
           }
           App.loading = true;

           // renovar o balanço e endereço da conta
           App.displayAccountInfo();

           let chainListInstance;
           

           App.contracts.ChainList.deployed().then((instance)=>{
                 chainListInstance = instance;
                 return chainListInstance.getArticlesForSale();
           }).then((articleIds)=>{
                 // retornar o placeholder do artigo e limpa-lo
                  $('#articlesRow').empty();

                  articleIds.forEach((articleId) => {
                        chainListInstance.articles(articleId.toNumber()).then((article)=>{
                             App.displayArticle(article[0], article[1], article[3], article[4], article[5]); 
                        });
                  });
                  App.loading = false;
                  
           }).catch((err) => {
                 console.error(err.message);
                 App.loading = false;

           });
     },
     displayArticle: function(id, seller, name, description, price) {
            let articlesRow= $('#articlesRow');
            let etherPrice = web3.fromWei(price, 'ether');
            let articleTemplate = $('#articleTemplate');
            
            articleTemplate.find('.panel-title').text(name);
            articleTemplate.find('.article-description').text(description);
            articleTemplate.find('.article-price').text(etherPrice + ' ETH');
            articleTemplate.find('.btn-buy').attr('data-id', id);
            articleTemplate.find('.btn-buy').attr('data-value', etherPrice);

            // seller
            if (seller == App.account) {
                  articleTemplate.find('.article-seller').text('You');
                  articleTemplate.find('.btn-buy').hide()
            } else {
                  articleTemplate.find('.article-seller').text(seller);
                  articleTemplate.find('.btn-buy').show()
            }
            // add this to the list of articles
            articlesRow.append(articleTemplate.html());
     },
     sellArticle: function() {
         // retornar os detalhes do artigo
         let _articleName = $('#article_name').val();
         let _description = $('#article_description').val();
         let _price = web3.toWei(parseFloat($('#article_price').val() || 0),'ether');
         if((_articleName.trim() === '') || (_price === 0)) {
               // nothing to sell
               return false;
         }  

         App.contracts.ChainList.deployed().then((instance)=>{
               return instance.sellArticle(_articleName, _description, _price, {from: App.account, gas: 500000});
         }).then((result)=>{
         }).catch((err)=>{
               console.error(err);
         })
     },
     // vai ouvir eventos ethereum
     ListenToEthEvents: function() {
           App.contracts.ChainList.deployed().then((instance) => {
                 instance.LogSellArticle({/*filter*/},{/*range*/}).watch((error,event)=>{
                       if (!error) {
                              $("#events").append('<li class="list-group-item">' + event.args._name + ' is now for sale</li>');
                       } else {
                             console.error(err);
                       }
                       App.reloadArticles();
                 });
                 instance.LogBuyArticle({/*filter*/},{/*range*/}).watch((error,event)=>{
                  if (!error) {
                         $("#events").append('<li class="list-group-item">' + event.args._buyer + ' bought ' + event.args._name + '</li>');
                  } else {
                        console.error(err);
                  }
                  App.reloadArticles();
            });
                 
           });
     },
     buyArticle: function() {
            event.preventDefault();
            //retrieve article price
            let _articleId = $(event.target).data('id');
            let _price = parseFloat($(event.target).data('value'));
            // instance of the contract
            App.contracts.ChainList.deployed().then((instance) => {
                  instance.buyArticle(_articleId, {from: App.account, value: web3.toWei(_price, "ether"), gas: 500000});
                  }
            ).catch((error)=>{
                  console.error(error);
            });   
     }

};

$(function() {
     $(window).load(function() {
          App.init();
     });
});
