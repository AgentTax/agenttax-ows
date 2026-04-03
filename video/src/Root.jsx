import { Composition } from 'remotion';
import { DemoVideo } from './DemoVideo.jsx';

export const RemotionRoot = () => {
  return (
    <Composition
      id="OWSTaxPolicy"
      component={DemoVideo}
      durationInFrames={900}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
