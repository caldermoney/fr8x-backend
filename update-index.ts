import { ethers } from "ethers";
import dotenv from "dotenv";
import fs from "node:fs/promises";
import path from "node:path";

dotenv.config();

type IndexRow = {
  route: string;
  asOf: string;
  currency: "USD";
  unit: "per_40FT";
  value: number;
};

function nextValue(prevValue: number): number {
  const change = (Math.random() - 0.5) * 100;
  return Math.max(1000, prevValue + change);
}

function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

async function readLatest(route: string): Promise<IndexRow | undefined> {
  const filePath = path.join("data", "latest.json");
  try {
    const data = await fs.readFile(filePath, "utf8");
    const rows = JSON.parse(data) as IndexRow[];
    return rows.find((r) => r.route === route);
  } catch {
    return undefined;
  }
}

async function pushToChain(value: number, contractAddress: string) {
  const provider = new ethers.JsonRpcProvider(process.env.HYPER_EVM_RPC);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
  const abi = [
    "function updatePrice(uint256 newValue) external",
    "function getLatest() external view returns (uint256 value, uint256 timestamp, string memory _route)"
  ];
  const contract = new ethers.Contract(contractAddress, abi, wallet);
  const tx = await contract.updatePrice(value);
  await tx.wait();
  console.log(`Pushed to chain: ${tx.hash}`);
}

async function writeLatestFiles(row: IndexRow) {
  const filePath = path.join("data", "latest.json");
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(filePath, JSON.stringify([row], null, 2) + "\n", "utf8");
}

async function main() {
  const route = "FREIGHT_SH-LA";
  const latest = await readLatest(route);
  const iso = todayISO();
  const prevVal = latest?.value ?? 2000;
  const value = nextValue(prevVal);

  const row: IndexRow = { route, asOf: iso, currency: "USD", unit: "per_40FT", value };
  await writeLatestFiles(row);

  const contractAddress = process.env.PRICE_FEEDER_ADDRESS;
  if (!contractAddress) {
    console.error("PRICE_FEEDER_ADDRESS not set in .env. Deploy contract first using forge script.");
    process.exit(1);
  }

  await pushToChain(value, contractAddress);
  console.log("Updated:", row);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});