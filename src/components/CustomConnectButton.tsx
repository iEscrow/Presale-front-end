'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit';

const CustomConnectButton = () => {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        // Note: If your app doesn't use authentication, you
        // can remove all 'authenticationStatus' checks
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus ||
            authenticationStatus === 'authenticated');

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              'style': {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button 
                    className='px-2 md:px-4 py-[2px] md:py-1 font-poppins tracking-tighter text-bg-logo text-sm border-[1px] border-bg-logo hover:bg-bg-logo hover:border-bg-logo hover:text-black duration-200 rounded-l-full rounded-r-full cursor-pointer' 
                    onClick={openConnectModal} 
                    type="button">
                      Connect Wallet
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button onClick={openChainModal} type="button">
                    Wrong network
                  </button>
                );
              }

              return (
                <div style={{ display: 'flex', gap: 12 }} className='items-center justify-center bg-black'>
                  <button
                    onClick={openChainModal}
                    style={{ display: 'flex', alignItems: 'center' }}
                    type="button"
                  >
                    {chain.hasIcon && (
                      <div
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: 999,
                          overflow: 'hidden',
                          marginRight: 2,
                        }}
                        className='flex items-center justify-center cursor-pointer'
                      >
                        {chain.iconUrl && (
                          <img
                            alt={chain.name ?? 'Chain icon'}
                            src={chain.iconUrl}
                            style={{ width: 21, height: 21 }}
                          />
                        )}
                      </div>
                    )}
                  </button>

                  <button onClick={openAccountModal} type="button" className='text-bg-logo font-poppins cursor-pointer text-xs leading-0'>
                    {account.displayName}
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
 
export default CustomConnectButton;