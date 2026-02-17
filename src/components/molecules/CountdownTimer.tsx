interface CountdownTimerProps {
  seconds: number;
}

export const CountdownTimer = ({ seconds }: CountdownTimerProps) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
      <div className="text-center">
        <div className="text-9xl font-bold text-white animate-pulse">
          {seconds}
        </div>
        <div className="text-white text-xl mt-4">초 후 촬영</div>
      </div>
    </div>
  );
};
