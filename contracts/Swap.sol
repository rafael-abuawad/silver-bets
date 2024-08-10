// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@uniswap/contracts/interfaces/IUniswapV3Factory.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/ISwapRouter02.sol";

contract Swap is Ownable {
    ISwapRouter02 immutable router;
    IUniswapV3Factory immutable uniswapFactory;

    address constant WAVAX = 0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7;
    uint24 constant POOL_FEE = 3000;

    constructor(address swapRouterAddress, address uniswapFactoryAddress) Ownable(msg.sender) {
        // swapRouterAddress = 0xbb00FF08d01D300023C629E8fFfFcb65A5a578cE
        // uniswapFactoryAddress = 0x33128a8fC17869897dcE68Ed026d694621f6FDfD
        router = ISwapRouter02(swapRouterAddress);
        uniswapFactory = IUniswapV3Factory(uniswapFactoryAddress);
    }

    function checkPoolExists(address tokenA, address tokenB) internal view returns (bool) {
        address poolAddress = uniswapFactory.getPool(tokenA, tokenB, POOL_FEE);
        return poolAddress != address(0);
    }
    
    function swapExactInputMultiHop(IERC20 tokenIn, IERC20 tokenOut, uint256 amountIn, uint256 amountOutMin)
        external returns (uint256 amountOut)
    {
        uint256 feeAmount = amountIn / 100; // Calcula el 1%
        uint256 swapAmount = amountIn - feeAmount; // 99%

        tokenIn.transferFrom(msg.sender, address(this), amountIn);
        tokenIn.transfer(owner(), feeAmount); // Transfiere el 1% a tu wallet
        tokenIn.approve(address(router), swapAmount);

        if (checkPoolExists(address(tokenIn), address(tokenOut))) {
            // Swap directo entre tokenIn y tokenOut
            ISwapRouter02.ExactInputSingleParams memory params = ISwapRouter02.ExactInputSingleParams({
                tokenIn: address(tokenIn),
                tokenOut: address(tokenOut),
                fee: POOL_FEE,
                recipient: msg.sender,
                amountIn: swapAmount,
                amountOutMinimum: amountOutMin,
                sqrtPriceLimitX96: 0
            });
            amountOut = router.exactInputSingle(params);
        } else {
            // Swap from tokenIn to WAVAX, then WAVAX to tokenOut
            ISwapRouter02.ExactInputSingleParams memory params1 = ISwapRouter02.ExactInputSingleParams({
                tokenIn: address(tokenIn),
                tokenOut: WAVAX,
                fee: POOL_FEE,
                recipient: address(this),
                amountIn: swapAmount,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            });
            uint256 WAVAXReceived = router.exactInputSingle(params1);

            IERC20(WAVAX).approve(address(router), WAVAXReceived);

            ISwapRouter02.ExactInputSingleParams memory params2 = ISwapRouter02.ExactInputSingleParams({
                tokenIn: WAVAX,
                tokenOut: address(tokenOut),
                fee: POOL_FEE,
                recipient: msg.sender,
                amountIn: WAVAXReceived,
                amountOutMinimum: amountOutMin,
                sqrtPriceLimitX96: 0
            });
            amountOut = router.exactInputSingle(params2);
        }
    }
}