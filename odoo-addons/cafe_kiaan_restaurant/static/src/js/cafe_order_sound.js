/** @odoo-module **/

import { registry } from "@web/core/registry";

const CHANNEL = "cafe_kiaan_new_orders";
const EVENT = "cafe_kiaan.order_created";

function playOrderChime() {
    console.log("🔥 CAFE KIAAN ORDER SOUND - 10 SECOND VERSION");

    try {
        const AudioContextClass =
            window.AudioContext || window.webkitAudioContext;

        if (!AudioContextClass) {
            console.warn("Web Audio API is not supported.");
            return;
        }

        const context = new AudioContextClass();

        const startPlayback = () => {
            const start = context.currentTime;
            const totalDuration = 5;

            // Louder master volume
            const masterGain = context.createGain();
            masterGain.gain.setValueAtTime(0.45, start);
            masterGain.connect(context.destination);

            // 3-tone alert pattern
            const pattern = [
                {
                    frequency: 784,
                    offset: 0.00,
                    duration: 0.20,
                },
                {
                    frequency: 988,
                    offset: 0.24,
                    duration: 0.20,
                },
                {
                    frequency: 1174.66,
                    offset: 0.48,
                    duration: 0.28,
                },
            ];

            // Repeat the alert for 10 seconds
            const repeatEvery = 0.90;

            for (
                let cycleStart = 0;
                cycleStart < totalDuration;
                cycleStart += repeatEvery
            ) {
                pattern.forEach(({ frequency, offset, duration }) => {
                    const at = cycleStart + offset;

                    if (at >= totalDuration) {
                        return;
                    }

                    const actualDuration = Math.min(
                        duration,
                        totalDuration - at
                    );

                    const oscillator = context.createOscillator();
                    const gain = context.createGain();

                    oscillator.type = "triangle";

                    oscillator.frequency.setValueAtTime(
                        frequency,
                        start + at
                    );

                    gain.gain.setValueAtTime(
                        0.0001,
                        start + at
                    );

                    gain.gain.exponentialRampToValueAtTime(
                        1,
                        start + at + 0.025
                    );

                    gain.gain.exponentialRampToValueAtTime(
                        0.0001,
                        start + at + actualDuration
                    );

                    oscillator.connect(gain);
                    gain.connect(masterGain);

                    oscillator.start(start + at);

                    oscillator.stop(
                        start + at + actualDuration + 0.03
                    );
                });
            }

            // Close audio context after 10 seconds
            window.setTimeout(() => {
                context.close().catch(() => {});
            }, 5250);
        };

        if (context.state === "suspended") {
            context
                .resume()
                .then(startPlayback)
                .catch((error) => {
                    console.warn(
                        "Café Kiaan order sound could not start:",
                        error
                    );
                });
        } else {
            startPlayback();
        }
    } catch (error) {
        console.warn(
            "Café Kiaan order sound failed:",
            error
        );
    }
}

const cafeOrderSoundService = {
    dependencies: ["bus_service", "notification"],

    start(env, { bus_service, notification }) {
        bus_service.addChannel(CHANNEL);

        bus_service.addEventListener(
            "notification",
            ({ detail: notifications }) => {
                for (const { type, payload } of notifications) {
                    if (type !== EVENT) {
                        continue;
                    }

                    notification.add(
                        payload.message ||
                            "A new Café Kiaan order has arrived.",
                        {
                            title:
                                payload.title ||
                                "New Café Kiaan Order",
                            type: "success",
                            sticky: false,
                        }
                    );

                    playOrderChime();
                }
            }
        );
    },
};

registry.category("services").add(
    "cafe_kiaan_order_sound",
    cafeOrderSoundService
);