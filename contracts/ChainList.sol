pragma solidity ^0.4.18;
import "./Ownable.sol";

contract ChainList is Ownable {
    // custom types

    struct Article {
        
        uint id;
        address seller;
        address buyer;
        string name;
        string description;
        uint256 price;  // um tipo de inteiro em 256 bits
    }

    // state variables

    mapping (uint => Article) public articles; // criara uma lista de Article s

    uint articleCounter; // esta variavel é para ajudar a saber o tamanho do mapping e quais chaves tem um certo valor
    address buyer;
    
    // events
    event LogSellArticle(uint indexed _id, address indexed _seller, string _name, uint256 _price);
    event LogBuyArticle( uint indexed _id, address indexed _seller, address indexed _buyer, string _name, uint256 _price);
    
    // functions
    // to sell an article
    function sellArticle(string _name, string _description, uint256 _price) public {
        // Versao antiga
        //  seller = msg.sender; // objeto msg
        //  name = _name;
        //  description = _description;
        //  price = _price;
        //  Versao com mapping:
        //  Guardandando artigos incrementalmente
        articleCounter++;
        articles[articleCounter] = Article(
            articleCounter, 
            msg.sender,
            0x0,
            _name,
            _description,
            _price
        );
        
        LogSellArticle(articleCounter, msg.sender, _name, _price);
    }
    // to get an article - deprecated 
        // function getArticle() public view returns (address _seller,address _buyer, string _name, string _description, uint _price) {
        //     return(seller, buyer, name, description, price);
        // }
    // get number of articles
    function getNumberOfArticles() public view returns (uint) {
        return articleCounter;
    }
    // number of identifiers for articles not sold yet
    function getArticlesForSale() public view returns (uint[]) {
        // prepare output array
        uint[] memory articleIds = new uint[](articleCounter);

        uint numberOfArticlesForSale = 0;
        // iterate over articles
        for(uint i = 1 ; i <= articleCounter; i++) {
            // keep the ID if the article is still for sale
            if (articles[i].buyer == 0x0) {
                articleIds[numberOfArticlesForSale] = articles[i].id;
                numberOfArticlesForSale++;
            }
        }
        // copy the articleIds array into a smaller forSale array
        uint[] memory forSale = new uint[](numberOfArticlesForSale);
        for(uint j = 0; j < numberOfArticlesForSale; j++) {
            forSale[j] = articleIds[j];
        }
        return forSale;
    }

    // to buy an article
    function buyArticle(uint _id) payable public {

        // checar se existe um artigo para venda
        //  require(seller != 0x0);
        require(articleCounter > 0);

        // Checar se o artigo existe
        require(_id > 0 && _id <= articleCounter);

        // trazer o article do mapping
        Article storage article = articles[_id];

        // checar se o artigo ainda nao foi vendido
        //  require(buyer == 0x0);
        require(article.buyer == 0x0);
        
        // evitar que o vendedor possa comprar seu proprio artigo
        // require(msg.sender != seller);
        require(msg.sender != article.seller);

        // checar se o valor enviado corresponde ao preço do artigo
        // require(msg.value == price);
        require(msg.value == article.price);
        
        //  keep buyers information
        // buyer = msg.sender;
        article.buyer = msg.sender;

        // the buyer can pay the seller - transferer os fundos do vendedor ao comprador
        article.seller.transfer(msg.value);

        // trigger the event
        LogBuyArticle(_id, article.seller, article.buyer, article.name, article.price);
    } 
    // deactivate the contract
    function kill() public onlyOwner { 

        selfdestruct(owner);
    }

}   