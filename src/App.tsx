import { useReducer } from 'react';
import { appReducer, initialState } from './state/appReducer';
import { frames } from './config/frames';
import { HomeScreen } from './screens/HomeScreen';
import { CaptureScreen } from './screens/CaptureScreen';
import { AdjustScreen } from './screens/AdjustScreen';
import { PreviewScreen } from './screens/PreviewScreen';
import { GalleryScreen } from './screens/GalleryScreen';
import { FrameEditorScreen } from './screens/FrameEditorScreen';

function App() {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const frame = frames.find((f) => f.id === state.frameId) ?? null;

  return (
    <div className="app fade-in">
      {state.step === 'home' && <HomeScreen dispatch={dispatch} />}
      {state.step === 'capture' && frame && (
        <CaptureScreen state={state} frame={frame} dispatch={dispatch} />
      )}
      {state.step === 'adjust' && frame && (
        <AdjustScreen state={state} frame={frame} dispatch={dispatch} />
      )}
      {state.step === 'preview' && frame && (
        <PreviewScreen state={state} frame={frame} dispatch={dispatch} />
      )}
      {state.step === 'gallery' && <GalleryScreen dispatch={dispatch} />}
      {state.step === 'edit' && <FrameEditorScreen dispatch={dispatch} />}
    </div>
  );
}

export default App;
