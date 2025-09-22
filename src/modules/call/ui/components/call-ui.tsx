import { useState } from "react";
import { StreamTheme, useCall } from "@stream-io/video-react-sdk";
import { CallingState } from "@stream-io/video-react-sdk";


import { CallLobby } from "./call-lobby";
import { CallActive } from "./call-active";
import { CallEnded } from "./call-ended";

interface Props {
    meetingName: string;
}

export const CallUI = ({ meetingName }: Props) => {
    const call = useCall();
    const [show, setShow] = useState<"lobby" | "call" | "ended">("lobby");

    const handleJoin = async () => {
        if (!call) return;
        try {
            // If already joined, just show the call UI
            if (call.state.callingState === CallingState.JOINED) {
                setShow("call");
                return;
            }
            await call.join({ create: true }); // create if first to join
            setShow("call");
        } catch (err) {
            console.error("Failed to join call:", err);
        }
    };

    const handleLeave = async () => {
        if (!call) return;

        const state = call.state.callingState;
        // If we’re already out, just move UI forward
        if (state === CallingState.LEFT || state === CallingState.IDLE) {
            setShow("ended");
            return;
        }

        try {
            await call.leave();              // prefer leave(); endCall() ends for everyone
        } catch (err: any) {
            // Ignore the “already been left” race
            if (!String(err).includes("already been left")) {
                console.error("Failed to leave call:", err);
            }
        } finally {
            setShow("ended");
        }
    };

    return (
        <StreamTheme className="h-full">
            {show === "lobby" && <CallLobby onJoin={handleJoin} />}
            {show === "call" && (
                <CallActive onLeave={handleLeave} meetingName={meetingName} />
            )}
            {show === "ended" && <CallEnded />}
        </StreamTheme>
    );
};
