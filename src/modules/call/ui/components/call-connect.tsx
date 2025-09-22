"use client";

import { LoaderIcon } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Call,
  CallingState,
  StreamCall,
  StreamVideo,
  StreamVideoClient,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";

import { trpc } from "@/trpc/client";
import { CallUI } from "./call-ui";

interface Props {
  meetingId: string;
  meetingName: string;
  userId: string;
  userName: string;
  userImage: string;
}

export const CallConnect = ({
  meetingId,
  meetingName,
  userId,
  userName,
  userImage,
}: Props) => {
  // tRPC mutation hook
  const generateTokenMutation = trpc.meetings.generateToken.useMutation();

  // Token provider must return a Promise<string>
  const tokenProvider = async () => {
    const token = await generateTokenMutation.mutateAsync();
    return token;
  };

  const [client, setClient] = useState<StreamVideoClient | undefined>(undefined);

  useEffect(() => {
    const _client = new StreamVideoClient({
      apiKey: process.env.NEXT_PUBLIC_STREAM_VIDEO_API_KEY!,
      user: {
        id: userId,
        name: userName,
        image: userImage,
      },
      tokenProvider,
    });

    setClient(_client);

    return () => {
      _client.disconnectUser();
      setClient(undefined);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, userName, userImage]);

  const [call, setCall] = useState<Call | undefined>(undefined);

  useEffect(() => {
    if (!client) return;

    const _call = client.call("default", meetingId);
    _call.camera.disable();
    _call.microphone.disable();
    setCall(_call);

    return () => {
      if (_call.state.callingState !== CallingState.LEFT) {
        // Leave the call if still connected; endCall only if you're the owner and intend to end it for everyone
        _call.leave();
      }
      setCall(undefined);
    };
  }, [client, meetingId]);

  if (!client || !call) {
    return (
      <div className="flex h-screen items-center justify-center bg-radial from-sidebar-accent to-sidebar">
        <LoaderIcon className="size-6 animate-spin text-white" />
      </div>
    );
  }

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <CallUI meetingName={meetingName} />
      </StreamCall>
    </StreamVideo>
  );
};
