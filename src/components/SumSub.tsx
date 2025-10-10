import SumsubWebSdk from "@sumsub/websdk-react";

const accessToken = '_act-sbx-jwt-eyJhbGciOiJub25lIn0.eyJqdGkiOiJfYWN0LXNieC1hYzQ5MmYxMi03NDJmLTRiYjUtYTQ0ZC1hZDk0MWU4NDE5NWItdjIiLCJ1cmwiOiJodHRwczovL2FwaS5zdW1zdWIuY29tIn0.-v2'

const SumSub = () => {
  return (
    <SumsubWebSdk
      testEnv={true}
      accessToken={accessToken}
      expirationHandler={() => Promise.resolve(accessToken)}
      config={{
        theme: 'dark',

      }}
      onMessage={(type, payload) => {
        console.log("WebSDK onMessage", type, payload);
      }}
      onError={(data) => console.log("onError", data)}
    />
  );
}

export default SumSub;