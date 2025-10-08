import { useWindowSize } from "@uidotdev/usehooks";
import { ToastBar, Toaster } from "react-hot-toast";

const Toast = () => {

  const { width } = useWindowSize()

  return (
    <Toaster
        position="bottom-right"
      >
        {(t) => (
          <ToastBar
            toast={t}
            position="bottom-right"
            style={{
              backgroundColor: '#121212',
              border: '1px solid #70707088',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: (width || 1000) >= 768 ? '8px' : '6px',
              width: (width || 1000) >= 768 ? '250px' : '200px'
            }}
          >
            {({ icon, message }) => (
              <>
                <span className="ml-[10px]">
                  {icon}
                </span>
                <span className="text-bg-logo text-xs md:text-sm font-poppins font-normal tracking-tighter select-none leading-0">
                  {message}
                </span>
              </>
            )}
          </ToastBar>
        )}
      </Toaster>
  );
}
 
export default Toast;