import React, { useEffect, useState } from "react";
import MyAlgoConnect, { Accounts } from "@randlabs/myalgo-connect";
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

const MainPage: React.FC = () => {
  const [algosCount, setAlgosCount] = useState<string>("");
  const [recPubKey, setRecPubKey] = useState<string>("");
  const [myAlgoConnect, setMyAlgoConnect] = useState<any>(null);
  const [userAccounts, setUserAccounts] = useState<Accounts[]>([]);
  const [senderAccount, setSenderAccount] = useState<string>("0");

  const handleConnectWallet = async () => {
    const myAlgoConnect = new MyAlgoConnect();
    const accountsSharedByUser = await myAlgoConnect.connect();
    console.log(accountsSharedByUser);
    setMyAlgoConnect(myAlgoConnect);
    setUserAccounts(accountsSharedByUser);
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
    const signedTxn = await myAlgoConnect.signTransaction(txn.toByte());
    const response = await algodClient.sendRawTransaction(signedTxn.blob).do();
  };

  const handleSendPubKeyChange = (event: SelectChangeEvent) => {
    setSenderAccount(event.target.value as string);
  };

  return (
    <div className={classes.container}>
      <p className={classes.title}>Send transaction with MyAlgoWallet</p>
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
                {value.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          id="sender-public-key-input"
          // label="Sender public key"
          variant="standard"
          disabled
          value={userAccounts[parseInt(senderAccount)]?.address}
        />
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
              myAlgoConnect &&
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
        <Link to="/algosigner">Switch to AlgoSigner</Link>
      </Stack>
    </div>
  );
};

export default MainPage;
