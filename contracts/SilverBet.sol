// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

/**
 * @title SilverBet
 * @dev Contrato inteligente para crear y gestionar apuestas.
 */
contract SilverBet is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable, ReentrancyGuard {
    error SilverBet__IncorrectFeeSend();
    error SilverBet__TokenDoesNotExists();
    error SilverBet__CallerIsNotOwner();
    error SilverBet__BetHasEnded();
    error SilverBet__FailedToSendAvax();

    enum Option {
        OPTION_1,
        OPTION_2
    }

    /**
     * @dev Estructura para representar una apuesta.
     * @param bettor Dirección del apostador.
     * @param option Opción elegida por el apostador.
     * @param amount Cantidad apostada.
     */
    struct Bet {
        address bettor;
        Option option;
        uint256 amount;
    }

    /**
     * @dev Estructura para representar la información de una apuesta.
     * @param title Título de la apuesta.
     * @param description Descripción de la apuesta.
     * @param minimumBet Apuesta mínima requerida.
     * @param startDate Fecha de inicio de la apuesta.
     * @param endDate Fecha de finalización de la apuesta.
     * @param balance Balance total de la apuesta.
     * @param owner Dirección del propietario de la apuesta.
     * @param bettingActive Indica si la apuesta está activa o no.
     */
    struct BetInformation {
        string title;
        string description;
        uint256 minimumBet;
        uint256 startDate;
        uint256 endDate;
        uint256 balance;
        address owner;
        bool bettingActive;
    }

    // Tarifa de creación de apuesta
    uint256 public immutable fee;

    // ID del siguiente token a crear
    uint256 private _nextTokenId;

    // Mapeo del ID del token a la información de la apuesta
    mapping(uint256 => BetInformation) private _tokenIdToInfo;

    // Mapeo del ID del token a las opciones de la apuesta
    mapping(uint256 => string[2]) private _tokenIdToOptions;

    // Mapeo del ID del token a las apuestas realizadas
    mapping(uint256 => Bet[]) private _tokenIdToBets;

    // Mapeo del ID del token a la imagen de portada
    mapping(uint256 => string) private _tokenIdToImage;

    event BetResolved(uint256 tokenId, Option winnerOption); // Evento emitido cuando se resuelve una apuesta

    /**
     * @dev Constructor del contrato.
     * @param initialOwner Dirección del propietario inicial.
     * @param fee_ Tarifa de creación de apuesta.
     */
    constructor(address initialOwner, uint256 fee_) ERC721("Silver Bet", "AGB") Ownable(initialOwner) {
        fee = fee_;
    }

    modifier tokenExists(uint256 tokenId) {
        if (tokenId >= _nextTokenId) {
            revert SilverBet__TokenDoesNotExists();
        }
        _;
    }

    modifier onlyBetOwner(uint256 tokenId) {
        if (msg.sender != _tokenIdToInfo[tokenId].owner) {
            revert SilverBet__CallerIsNotOwner();
        }
        _;
    }

    function _baseURI() internal pure override returns (string memory) {
        return "http://localhost:3000/";
    }

    /**
     * @dev Función interna para establecer la información de un token.
     * @param tokenId ID del token.
     * @param title Título de la apuesta.
     * @param description Descripción de la apuesta.
     * @param minimumBet Apuesta mínima requerida.
     * @param options Opciones de la apuesta.
     */
    function _setTokenInfo(
        uint256 tokenId,
        string memory title,
        string memory description,
        uint256 minimumBet,
        string[2] memory options
    ) private {
        BetInformation memory info = BetInformation({
            title: title,
            description: description,
            minimumBet: minimumBet,
            startDate: block.timestamp,
            endDate: 0,
            balance: 0,
            owner: msg.sender,
            bettingActive: true
        });
        _tokenIdToInfo[tokenId] = info;
        _tokenIdToOptions[tokenId] = options;
    }

    /**
     * @dev Función interna para establecer la información de un token.
     * @param tokenId ID del token.
     * @param imageURL URL de la imagen que se quiere usar para la apuesta.
     */
    function _setTokenImage(uint256 tokenId, string memory imageURL) private {
        _tokenIdToImage[tokenId] = imageURL;
    }

    /**
     * @dev Función para crear una nueva apuesta.
     * @param title Título de la apuesta.
     * @param description Descripción de la apuesta.
     * @param minimumBet Apuesta mínima requerida.
     * @param options Opciones de la apuesta.
     * @return tokenId ID del token asociado a la nueva apuesta.
     */
    function createBet(string memory title, string memory description, uint256 minimumBet, string[2] memory options)
        public
        payable
        returns (uint256)
    {
        if (msg.value != fee) {
            revert SilverBet__IncorrectFeeSend();
        }

        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, "");
        _setTokenImage(tokenId, "demo.png"); // TODO: add image support
        _setTokenInfo(tokenId, title, description, minimumBet, options);
        return tokenId;
    }

    /**
     * @dev Función para participar en una apuesta.
     * @param tokenId ID del token asociado a la apuesta.
     * @param option Opción elegida por el apostador.
     */
    function enterBet(uint256 tokenId, Option option) public payable tokenExists(tokenId) nonReentrant {
        BetInformation storage info = _tokenIdToInfo[tokenId];
        if (msg.value < info.minimumBet) {
            revert SilverBet__IncorrectFeeSend();
        }
        info.balance += msg.value;
        _tokenIdToBets[tokenId].push(Bet({bettor: msg.sender, option: option, amount: msg.value}));
    }

    /**
     * @dev Función para cerrar la votación y procesar los pagos.
     * @param tokenId ID del token asociado a la apuesta.
     * @param winnerOption Opción ganadora.
     * @return true si la operación se completó con éxito, false en caso contrario.
     */
    function closeBet(uint256 tokenId, Option winnerOption)
        public
        tokenExists(tokenId)
        onlyBetOwner(tokenId)
        nonReentrant
        returns (bool)
    {
        BetInformation storage betInfo = _tokenIdToInfo[tokenId];
        if (!betInfo.bettingActive) {
            revert SilverBet__BetHasEnded();
        }

        uint256 totalBetAmount = betInfo.balance;

        // Calcular y transferir el 1% del total al propietario y al creador
        uint256 fee = totalBetAmount / 100;
        uint256 remainingAmount = totalBetAmount - (2 * fee);

        (bool sent,) = betInfo.owner.call{value: fee}("");
        if (!sent) {
            revert SilverBet__FailedToSendAvax();
        }

        (sent,) = owner().call{value: fee}("");
        if (!sent) {
            revert SilverBet__FailedToSendAvax();
        }

        // Calcular y transferir los fondos a los ganadores
        Bet[] memory bets = _tokenIdToBets[tokenId];
        for (uint256 i = 0; i < bets.length; i++) {
            Bet memory bet = bets[i];
            if (bet.option == winnerOption) {
                uint256 betAmount = bet.amount;
                uint256 amountToTransfer = (betAmount * remainingAmount) / totalBetAmount;

                (sent,) = payable(bet.bettor).call{value: amountToTransfer}("");
                if (!sent) {
                    revert SilverBet__FailedToSendAvax();
                }
            }
        }

        betInfo.bettingActive = false;
        betInfo.endDate = block.timestamp;
        emit BetResolved(tokenId, winnerOption);
        return true;
    }

    // Funciones requeridas por la herencia de contratos

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        BetInformation memory info = _tokenIdToInfo[tokenId];
        string memory tokenImage = _tokenIdToImage[tokenId];
        string memory jsonString = _buildJSONString(tokenImage, info, _tokenIdToBets[tokenId].length);
        return string(abi.encodePacked("data:application/json;base64,", Base64.encode(bytes(jsonString))));
    }

    function _buildJSONString(string memory tokenImage, BetInformation memory info, uint256 betCount)
        private
        pure
        returns (string memory)
    {
        return string(
            abi.encodePacked(
                "{",
                '"name": "',
                info.title,
                '",',
                '"description": "',
                info.description,
                '",',
                '"image": "',
                tokenImage,
                '",',
                '"attributes": [',
                _buildTVLAttribute(info.balance),
                _buildStartDateAttribute(info.startDate),
                _buildBettorsAttribute(betCount),
                "]",
                "}"
            )
        );
    }

    function _buildTVLAttribute(uint256 balance) private pure returns (string memory) {
        return string(abi.encodePacked("{", '"trait_type": "TVL",', '"value": ', Strings.toString(balance), "},"));
    }

    function _buildStartDateAttribute(uint256 startDate) private pure returns (string memory) {
        return string(
            abi.encodePacked(
                "{",
                '"trait_type": "Start date",',
                '"display_type": "date",',
                '"value": ',
                Strings.toString(startDate),
                "},"
            )
        );
    }

    function _buildBettorsAttribute(uint256 betCount) private pure returns (string memory) {
        return string(abi.encodePacked("{", '"trait_type": "Bettors",', '"value": ', Strings.toString(betCount), "}"));
    }

    // Funciones getter

    function getTokenInfo(uint256 tokenId) public view tokenExists(tokenId) returns (BetInformation memory) {
        return _tokenIdToInfo[tokenId];
    }

    function getTitle(uint256 tokenId) public view tokenExists(tokenId) returns (string memory) {
        return _tokenIdToInfo[tokenId].title;
    }

    function getDescription(uint256 tokenId) public view tokenExists(tokenId) returns (string memory) {
        return _tokenIdToInfo[tokenId].description;
    }

    function getMinimumBet(uint256 tokenId) public view tokenExists(tokenId) returns (uint256) {
        return _tokenIdToInfo[tokenId].minimumBet;
    }

    function getStartDate(uint256 tokenId) public view tokenExists(tokenId) returns (uint256) {
        return _tokenIdToInfo[tokenId].startDate;
    }

    function getEndDate(uint256 tokenId) public view tokenExists(tokenId) returns (uint256) {
        return _tokenIdToInfo[tokenId].endDate;
    }

    function getBalance(uint256 tokenId) public view tokenExists(tokenId) returns (uint256) {
        return _tokenIdToInfo[tokenId].balance;
    }

    function getOwner(uint256 tokenId) public view tokenExists(tokenId) returns (address) {
        return _tokenIdToInfo[tokenId].owner;
    }

    function getIsBettingActive(uint256 tokenId) public view tokenExists(tokenId) returns (bool) {
        return _tokenIdToInfo[tokenId].bettingActive;
    }

    function getOptionList(uint256 tokenId) public view tokenExists(tokenId) returns (string[2] memory) {
        return _tokenIdToOptions[tokenId];
    }

    function getBetList(uint256 tokenId) public view tokenExists(tokenId) returns (Bet[] memory) {
        return _tokenIdToBets[tokenId];
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev Función para recolectar las tarifas de creación de apuesta.
     * @param _to Dirección a la que se enviarán los fondos.
     */
    function collectFees(address payable _to) public payable onlyOwner {
        (bool sent, bytes memory data) = _to.call{value: address(this).balance}("");
        if (!sent) {
            revert SilverBet__FailedToSendAvax();
        }
    }
}
