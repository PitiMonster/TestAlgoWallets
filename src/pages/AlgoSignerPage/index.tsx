import React, { useEffect, useState } from "react";
import MyAlgoConnect from "@randlabs/myalgo-connect";
import algosdk from "algosdk";
import { Routes, Route, Link } from "react-router-dom";

import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";

import classes from "./index.module.scss";
import { FormControl } from "@mui/material";

interface CustomTokenHeader {
  [headerName: string]: string;
}

interface Account {
  address: string;
}

declare let AlgoSigner: any;

const MainPage: React.FC = () => {
  const [algosCount, setAlgosCount] = useState<string>("");
  const [recPubKey, setRecPubKey] = useState<string>("");
  const [myAlgoConnect, setMyAlgoConnect] = useState<any>(null);
  const [userAccounts, setUserAccounts] = useState<Account[]>([]);
  const [senderAccount, setSenderAccount] = useState<string>("0");

  const handleConnectWallet = async () => {
    if (typeof AlgoSigner !== "undefined") {
      console.log("AlgoSigner is installed.");
    } else {
      console.log("AlgoSigner is NOT installed.");
    }
    AlgoSigner.connect()
      .then((d: any) => {
        console.log(JSON.stringify(d));
      })
      .catch((e: any) => {
        console.error(e);
        console.log(JSON.stringify(e));
      });
    AlgoSigner.accounts({
      ledger: "TestNet",
    })
      .then((d: any) => {
        console.log(JSON.stringify(d));
        setUserAccounts(d);
      })
      .catch((e: any) => {
        console.error(e);
        console.log(JSON.stringify(e));
      });
  };
  const handleSendTransaction = async () => {
    const tokenHeader: CustomTokenHeader = {
      "x-api-key": process.env.REACT_APP_PURESTAKE_TOKEN as string,
    };
    const algodClient = new algosdk.Algodv2(
      tokenHeader,
      "https://testnet-algorand.api.purestake.io/ps2",
      ""
    );
    const params = await algodClient.getTransactionParams().do();
    const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      suggestedParams: params,
      from: userAccounts[parseInt(senderAccount)]?.address,
      to: recPubKey,
      amount: parseInt(algosCount),
    });
    let txn_b64 = AlgoSigner.encoding.msgpackToBase64(txn.toByte());
    const signedTxns = await AlgoSigner.signTxn([{ txn: txn_b64 }]);

    const response = await AlgoSigner.send({
      ledger: "TestNet",
      tx: signedTxns[0].blob,
    });
  };

  const handleSendPubKeyChange = (event: SelectChangeEvent) => {
    setSenderAccount(event.target.value as string);
  };

  return (
    <div className={classes.container}>
      <p className={classes.title}>Send transaction with AlgoSigner</p>
      <Stack sx={{ width: "60vw" }} spacing={5}>
        <TextField
          id="stats-amount-input"
          label="Algos count"
          variant="standard"
          value={algosCount}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setAlgosCount(event.target.value);
          }}
        />
        <FormControl fullWidth>
          <InputLabel id="sender-account-label">Sender account</InputLabel>
          <Select
            labelId="sender-account-label"
            id="sender-account"
            value={senderAccount}
            label="Sender account"
            onChange={handleSendPubKeyChange}
          >
            {/* <MenuItem value={10}>Ten</MenuItem>
            <MenuItem value={20}>Twenty</MenuItem>
            <MenuItem value={30}>Thirty</MenuItem> */}
            {userAccounts.map((value, index) => (
              <MenuItem key={value.address} value={index}>
                {value.address}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {/* <TextField
          id="sender-public-key-input"
          // label="Sender public key"
          variant="standard"
          disabled
          value={userAccounts[parseInt(senderAccount)]?.address}
        /> */}
        <TextField
          id="receiver-public-key-input"
          label="Receiver public key"
          variant="standard"
          value={recPubKey}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setRecPubKey(event.target.value);
          }}
        />
        <Button variant="contained" onClick={handleConnectWallet}>
          Connect
        </Button>
        <Button
          disabled={
            !(
              recPubKey &&
              userAccounts[parseInt(senderAccount)]?.address &&
              +algosCount
            )
          }
          variant="contained"
          onClick={handleSendTransaction}
        >
          Send txs
        </Button>
        <Link to="/myalgowallet">Switch to MyAlgoWallet</Link>
      </Stack>
    </div>
  );
};

export default MainPage;
