// import { useEffect, useState } from "react";
import { useEffect, useState } from "react";
import LotteryABI from "../abis/Lottery.json";
import LotteryTokenABI from "../abis/LotteryToken.json";
import { ethers } from "ethers";
import type { NextPage } from "next";
import { useAccount, useBalance, useContractRead, useContractWrite, useNetwork } from "wagmi";

const TOKEN_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_ADDRESS;
const RPC_ENDPOINT_URL = process.env.NEXT_PUBLIC_RPC_ENDPOINT_URL;
const LOTTERY_ADDRESS = process.env.NEXT_PUBLIC_LOTTERY_ADDRESS;
const TOKEN_RATIO = 1000n;

const Home: NextPage = () => {
  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center mb-8">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">Scaffold-ETH 2</span>
          </h1>
          <p className="text-center text-lg">
            Get started by editing{" "}
            <code className="italic bg-base-300 text-base font-bold max-w-full break-words break-all inline-block">
              packages/nextjs/pages/index.tsx
            </code>
          </p>
          <PageBody></PageBody>
        </div>
      </div>
    </>
  );
};

function PageBody() {
  return (
    <>
      <p className="text-center text-lg">Here we are!</p>
      <WalletInfo></WalletInfo>
    </>
  );
}

function WalletInfo() {
  const { address, isConnecting, isDisconnected } = useAccount();
  const { chain } = useNetwork();
  if (address)
    return (
      <div>
        <p>Your account address is {address}</p>
        <p>Connected to the network {chain?.name}</p>
        <WalletBalance address={address as `0x${string}`}></WalletBalance>
        <TokenInfo address={address as `0x${string}`}></TokenInfo>
        <CheckStateBox></CheckStateBox>
        <OpenBetsBox></OpenBetsBox>
        <TopUpBox></TopUpBox>
        <BurnBox></BurnBox>
        <CloseLotteryBox></CloseLotteryBox>
        <ApproveBox></ApproveBox>
        <BetBox></BetBox>
        <PrizeBox address={address as `0x${string}`}></PrizeBox>
        <OwnerPrizeBox></OwnerPrizeBox>
      </div>
    );
  if (isConnecting)
    return (
      <div>
        <p>Loading...</p>
      </div>
    );
  if (isDisconnected)
    return (
      <div>
        <p>Wallet disconnected. Connect wallet to continue</p>
      </div>
    );
  return (
    <div>
      <p>Connect wallet to continue</p>
    </div>
  );
}

function WalletBalance(params: { address: `0x${string}` }) {
  const { data, isError, isLoading } = useBalance({
    address: params.address,
  });

  if (isLoading) return <div>Fetching balance…</div>;
  if (isError) return <div>Error fetching balance</div>;
  return (
    <div className="card w-96 bg-primary text-primary-content mt-4">
      <div className="card-body">
        <h2 className="card-title">Testing useBalance wagmi hook</h2>
        Balance: {data?.formatted} {data?.symbol}
      </div>
    </div>
  );
}

function TokenInfo(params: { address: `0x${string}` }) {
  return (
    <div className="card w-96 bg-primary text-primary-content mt-4">
      <div className="card-body">
        <h2 className="card-title">Token:</h2>
        <TokenName></TokenName>
        <TokenTotalSupply></TokenTotalSupply>
        <TokenBalance address={params.address}></TokenBalance>
      </div>
    </div>
  );
}

function TokenName() {
  const { data, isError, isLoading } = useContractRead({
    address: TOKEN_ADDRESS,
    abi: LotteryTokenABI,
    functionName: "name",
  });

  const name = typeof data === "string" ? data : 0;

  if (isLoading) return <div>Fetching name…</div>;
  if (isError) return <div>Error fetching name</div>;
  return <div>Token name: {name}</div>;
}

function TokenTotalSupply() {
  const { data, isError, isLoading } = useContractRead({
    address: TOKEN_ADDRESS,
    abi: LotteryTokenABI,
    functionName: "totalSupply",
  });

  const totalSupply = data as bigint;

  if (isLoading) return <div>Fetching name…</div>;
  if (isError) return <div>Error fetching name</div>;
  return <div>Token Total Supply: {ethers.formatUnits(totalSupply).toString()}</div>;
}

function TokenBalance(params: { address: `0x${string}` }) {
  const { data, isError, isLoading } = useContractRead({
    address: TOKEN_ADDRESS,
    abi: LotteryTokenABI,
    functionName: "balanceOf",
    args: [params.address],
  });

  const balance = data as bigint;

  if (isLoading) return <div>Fetching name…</div>;
  if (isError) return <div>Error fetching name</div>;
  return <div>Token Balance: {ethers.formatUnits(balance).toString()}</div>;
}

function CheckStateBox() {
  return (
    <div className="card w-96 bg-primary text-primary-content mt-4">
      <div className="card-body">
        <h2 className="card-title">Check state:</h2>
        <CheckState></CheckState>
      </div>
    </div>
  );
}

function CheckState() {
  const { data, isError, isLoading } = useContractRead({
    address: LOTTERY_ADDRESS,
    abi: LotteryABI,
    functionName: "betsOpen",
  });

  const [timestamp, setBlockTimestamp] = useState<number>(0);
  useEffect(() => {
    const fetchBlockTimestamp = async () => {
      // Create an ethers provider
      const provider = new ethers.JsonRpcProvider(RPC_ENDPOINT_URL);

      try {
        // Fetch the latest block
        const latestBlock = await provider.getBlock("latest");

        // Check if the latestBlock is not null
        if (latestBlock) {
          // Update the blockTimestamp state with the block's timestamp
          setBlockTimestamp(latestBlock.timestamp);
        } else {
          console.error("Could not fetch the latest block");
        }
      } catch (error) {
        console.error("Error fetching the latest block:", error);
      }
    };

    fetchBlockTimestamp();
  }, []);

  const {
    data: data2,
    isError: isError2,
    isLoading: isLoading2,
  } = useContractRead({
    address: LOTTERY_ADDRESS,
    abi: LotteryABI,
    functionName: "betsClosingTime",
  });

  if (isLoading) return <div>Fetching ...</div>;
  if (isError) return <div>Error fetching </div>;
  const state = data;

  if (!state) return <div>The lottery is {state ? "open" : "closed"}</div>;

  const currentBlockDate = new Date(timestamp * 1000);

  if (isLoading2) return <div>Fetching ...</div>;
  if (isError2) return <div>Error fetching </div>;

  const closingTime = data2 as bigint;
  const closingTimeDate = new Date(Number(closingTime) * 1000);
  return (
    <div>
      The lottery is {state ? "open" : "closed"}
      <p>
        The last block was mined at {currentBlockDate.toLocaleDateString()} : {currentBlockDate.toLocaleTimeString()}
      </p>
      <p>
        lottery should close at {closingTimeDate.toLocaleDateString()} : {closingTimeDate.toLocaleTimeString()}
      </p>
    </div>
  );
}

function OpenBetsBox() {
  return <OpenBets></OpenBets>;
}

function OpenBets() {
  const [timestamp, setBlockTimestamp] = useState<number>(0);
  useEffect(() => {
    const fetchBlockTimestamp = async () => {
      // Create an ethers provider
      const provider = new ethers.JsonRpcProvider(RPC_ENDPOINT_URL);

      try {
        // Fetch the latest block
        const latestBlock = await provider.getBlock("latest");

        // Check if the latestBlock is not null
        if (latestBlock) {
          // Update the blockTimestamp state with the block's timestamp
          setBlockTimestamp(latestBlock.timestamp);
        } else {
          console.error("Could not fetch the latest block");
        }
      } catch (error) {
        console.error("Error fetching the latest block:", error);
      }
    };

    fetchBlockTimestamp();
  }, []);

  const [duration, setDuration] = useState<number>(0);
  const { data, isLoading, isSuccess, write } = useContractWrite({
    address: LOTTERY_ADDRESS,
    abi: LotteryABI,
    functionName: "openBets",
  });
  return (
    <div className="card w-96 bg-primary text-primary-content mt-4">
      <div className="card-body">
        <h2 className="card-title">Open bets</h2>
        <div className="form-control w-full max-w-xs my-4">
          <label>
            Enter duration (in seconds):
            <input
              type="text"
              placeholder="Type here"
              className="input input-bordered w-full max-w-xs"
              value={duration}
              onChange={e => setDuration(Number(e.target.value))}
            />
          </label>
        </div>
        <button
          className="btn btn-active btn-neutral"
          disabled={isLoading}
          onClick={() => write({ args: [timestamp + duration] })}
        >
          Open bets
        </button>
        {isLoading && <div>Check Wallet</div>}
        {isSuccess && <div>Transaction: {JSON.stringify(data)}</div>}
      </div>
    </div>
  );
}

function TopUpBox() {
  return <TopUp></TopUp>;
}

function TopUp() {
  const [amount, setAmount] = useState<number>(0);
  const { data, isLoading, isSuccess, write } = useContractWrite({
    address: LOTTERY_ADDRESS,
    abi: LotteryABI,
    functionName: "purchaseTokens",
  });
  return (
    <div className="card w-96 bg-primary text-primary-content mt-4">
      <div className="card-body">
        <h2 className="card-title">Top up tokens</h2>
        <div className="form-control w-full max-w-xs my-4">
          <label>
            Enter number of tokens to purchase:
            <input
              type="text"
              placeholder="Type here"
              className="input input-bordered w-full max-w-xs"
              value={amount}
              onChange={e => setAmount(Number(e.target.value))}
            />
          </label>
        </div>
        <button
          className="btn btn-active btn-neutral"
          disabled={isLoading}
          onClick={() => write({ value: ethers.parseUnits(amount.toString()) / TOKEN_RATIO })}
        >
          Top up
        </button>
        {isLoading && <div>Check Wallet</div>}
        {isSuccess && <div>Transaction: {JSON.stringify(data)}</div>}
      </div>
    </div>
  );
}

function CloseLotteryBox() {
  return <CloseLottery></CloseLottery>;
}

function CloseLottery() {
  const { data, isLoading, isSuccess, write } = useContractWrite({
    address: LOTTERY_ADDRESS,
    abi: LotteryABI,
    functionName: "closeLottery",
  });
  return (
    <div className="card w-96 bg-primary text-primary-content mt-4">
      <div className="card-body">
        <h2 className="card-title">Close lottery</h2>
        <div className="form-control w-full max-w-xs my-4"></div>
        <button className="btn btn-active btn-neutral" disabled={isLoading} onClick={() => write({})}>
          Close lottery
        </button>
        {isLoading && <div>Check Wallet</div>}
        {isSuccess && <div>Transaction: {JSON.stringify(data)}</div>}
      </div>
    </div>
  );
}

function ApproveBox() {
  return <Approve></Approve>;
}

function Approve() {
  const { data, isLoading, isSuccess, write } = useContractWrite({
    address: TOKEN_ADDRESS,
    abi: LotteryTokenABI,
    functionName: "approve",
  });
  return (
    <div className="card w-96 bg-primary text-primary-content mt-4">
      <div className="card-body">
        <h2 className="card-title">Approve token</h2>
        <div className="form-control w-full max-w-xs my-4">
          <label>Approve lottery contract to spend token:</label>
        </div>
        <button
          className="btn btn-active btn-neutral"
          disabled={isLoading}
          onClick={() => write({ args: [LOTTERY_ADDRESS, ethers.MaxUint256] })}
        >
          Approve
        </button>
        {isLoading && <div>Check Wallet</div>}
        {isSuccess && <div>Transaction: {JSON.stringify(data)}</div>}
      </div>
    </div>
  );
}

function BetBox() {
  return <Bet></Bet>;
}

function Bet() {
  const [amount, setAmount] = useState<number>(0);
  const { data, isLoading, isSuccess, write } = useContractWrite({
    address: LOTTERY_ADDRESS,
    abi: LotteryABI,
    functionName: "betMany",
  });
  return (
    <div className="card w-96 bg-primary text-primary-content mt-4">
      <div className="card-body">
        <h2 className="card-title">Make bets</h2>
        <div className="form-control w-full max-w-xs my-4">
          <label>
            Enter number of bets:
            <input
              type="text"
              placeholder="Type here"
              className="input input-bordered w-full max-w-xs"
              value={amount}
              onChange={e => setAmount(Number(e.target.value))}
            />
          </label>
        </div>
        <button className="btn btn-active btn-neutral" disabled={isLoading} onClick={() => write({ args: [amount] })}>
          Make bets
        </button>
        {isLoading && <div>Check Wallet</div>}
        {isSuccess && <div>Transaction: {JSON.stringify(data)}</div>}
      </div>
    </div>
  );
}

function PrizeBox(params: { address: `0x${string}` }) {
  return <Prize address={params.address}></Prize>;
}

function Prize(params: { address: `0x${string}` }) {
  const {
    data: data1,
    isError: isError1,
    isLoading: isLoading1,
  } = useContractRead({
    address: LOTTERY_ADDRESS,
    abi: LotteryABI,
    functionName: "prizePool",
  });

  const { data, isError, isLoading } = useContractRead({
    address: LOTTERY_ADDRESS,
    abi: LotteryABI,
    functionName: "prize",
    args: [params.address],
  });

  const {
    data: data2,
    isLoading: isLoading2,
    isSuccess: isSuccess2,
    write,
  } = useContractWrite({
    address: LOTTERY_ADDRESS,
    abi: LotteryABI,
    functionName: "prizeWithdraw",
  });

  if (isLoading1) return <div>Fetching ...</div>;
  if (isError1) return <div>Error fetching </div>;

  const prizePool = data1 as bigint;
  const prize = data as bigint;

  if (isLoading) return <div>Fetching name…</div>;
  if (isError) return <div>Error fetching name</div>;
  return (
    <div className="card w-96 bg-primary text-primary-content mt-4">
      <div className="card-body">
        <h2 className="card-title">Prize pool:</h2>
        <div>Total prize pool: {ethers.formatUnits(prizePool.toString()).toString()}</div>
        <div>Your prize: {ethers.formatUnits(prize.toString()).toString()}</div>
        <button className="btn btn-active btn-neutral" disabled={isLoading2} onClick={() => write({ args: [prize] })}>
          Claim Prize
        </button>
        {isLoading2 && <div>Check Wallet</div>}
        {isSuccess2 && <div>Transaction: {JSON.stringify(data2)}</div>}
      </div>
    </div>
  );
}

function OwnerPrizeBox() {
  return <OwnerPrize></OwnerPrize>;
}

function OwnerPrize() {
  const { data, isError, isLoading } = useContractRead({
    address: LOTTERY_ADDRESS,
    abi: LotteryABI,
    functionName: "ownerPool",
  });

  const ownerPool = data as bigint;

  const {
    data: data2,
    isLoading: isLoading2,
    isSuccess: isSuccess2,
    write,
  } = useContractWrite({
    address: LOTTERY_ADDRESS,
    abi: LotteryABI,
    functionName: "ownerWithdraw",
  });

  if (isLoading) return <div>Fetching name…</div>;
  if (isError) return <div>Error fetching name</div>;
  return (
    <div className="card w-96 bg-primary text-primary-content mt-4">
      <div className="card-body">
        <h2 className="card-title">Owner pool:</h2>
        <div>Total owner pool: {ethers.formatUnits(ownerPool)}</div>
        <button
          className="btn btn-active btn-neutral"
          disabled={isLoading2}
          onClick={() => write({ args: [ownerPool] })}
        >
          Claim Owner Pool
        </button>
        {isLoading2 && <div>Check Wallet</div>}
        {isSuccess2 && <div>Transaction: {JSON.stringify(data2)}</div>}
      </div>
    </div>
  );
}

function BurnBox() {
  return <Burn></Burn>;
}

function Burn() {
  const [amount, setAmount] = useState<number>(0);
  const { data, isLoading, isSuccess, write } = useContractWrite({
    address: LOTTERY_ADDRESS,
    abi: LotteryABI,
    functionName: "returnTokens",
  });
  return (
    <div className="card w-96 bg-primary text-primary-content mt-4">
      <div className="card-body">
        <h2 className="card-title">Burn tokens</h2>
        <div className="form-control w-full max-w-xs my-4">
          <label>
            Enter number of tokens to burn:
            <input
              type="text"
              placeholder="Type here"
              className="input input-bordered w-full max-w-xs"
              value={amount}
              onChange={e => setAmount(Number(e.target.value))}
            />
          </label>
        </div>
        <button
          className="btn btn-active btn-neutral"
          disabled={isLoading}
          onClick={() => write({ args: [ethers.parseUnits(amount.toString())] })}
        >
          Burn tokens
        </button>
        {isLoading && <div>Check Wallet</div>}
        {isSuccess && <div>Transaction: {JSON.stringify(data)}</div>}
      </div>
    </div>
  );
}

export default Home;
