import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("ZeroTest", function () {
  let zeroTest: any;
  let contractAddress = "";
  const contributors: string[] = [];
  let userGroup: SignerWithAddress[] = [];

  let erc20Mock: any;
  let tokenAddress = "";

  before(async function () {
    userGroup = await ethers.getSigners();

    let index = 0;

    userGroup.forEach((user: SignerWithAddress) => {
      if (index > 0) {
        contributors.push(user.address);
      }
      index += 1;
    });

    const ZeroTest = await ethers.getContractFactory("ZeroTest");
    zeroTest = await ZeroTest.deploy(userGroup.length);
    await zeroTest.deployed();

    const ERC20Mock = await ethers.getContractFactory("ERC20Mock");
    erc20Mock = await ERC20Mock.deploy("testToken", "TTN");
    await erc20Mock.deployed();
    tokenAddress = erc20Mock.address;
  });

  it("Should be deployed", async function () {
    contractAddress = zeroTest.address;
    console.log("ZeroTest contract Address", contractAddress);
  });

  it("should distribute same amount", async function () {
    await erc20Mock.mint(userGroup[0].address, 20000);
    await erc20Mock.connect(userGroup[0]).approve(contractAddress, 10000);
    await zeroTest
      .connect(userGroup[0])
      .multisendToken(tokenAddress, contributors, 10000);
    const balanceA = await erc20Mock.balanceOf(contributors[1]);
    console.log(balanceA);
    expect(balanceA).to.equal(525);
  });

  it("Should be sent the Eth via multisendToken function", async function () {
    const amount = ethers.utils.parseUnits("200", "ether");
    await zeroTest.multisendToken(contractAddress, contributors, 0, {
      value: amount,
    });
  });

  it("Should can divide the token to the contributors less than deployed limitation", async function () {
    const amount = ethers.utils.parseUnits("200", "ether");
    const tempContributors: string[] = [];
    userGroup.forEach((user) => {
      tempContributors.push(user.address);
    });
    userGroup.forEach((user) => {
      tempContributors.push(user.address);
    });
    await expect(
      zeroTest.multisendToken(contractAddress, tempContributors, 0, {
        value: amount,
      })
    ).to.be.revertedWith("Too many dividers");
  });

  it("should be withdrawed only contract owner", async function () {
    const withdrawAmount = ethers.utils.parseUnits("0.1", "ether");
    await zeroTest.withdraw(contractAddress, withdrawAmount);
  });

  it("should be that withdraw amount is less than contract balance", async function () {
    const withdrawAmount = ethers.utils.parseUnits("1", "ether");
    await expect(
      zeroTest.withdraw(contractAddress, withdrawAmount)
    ).to.be.revertedWith("insufficient balance!");
  });
});
