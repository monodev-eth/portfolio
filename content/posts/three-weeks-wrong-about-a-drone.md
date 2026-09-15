---
title: Three weeks of being wrong about a drone
date: 2026-09-12
excerpt: Fifteen diagnoses, one misleading correlation, and the board swap that finally fixed my video feed.
summary: My whoop's video feed collapsed every time I flew it. I produced about fifteen confident diagnoses over three weeks, built most of them on a correlation that turned out not to exist, and in the end fixed it by swapping the board.
cover: /blog/cover-drone.jpg
coverAlt: Macro photo of the Air75 II flight controller inside its frame, wires and gyro chip visible
tags: fpv, hardware, debugging
---

The BetaFPV Air75 II arrived on 16 July. It is a 21 gram ducted whoop about the size of a coaster, it cost A$150, and it is the cheap crashable trainer I [talked myself into buying](/blog/fpv-research-rabbit-hole) instead of a $1,400 digital build. On 22 July it hit concrete on its third flight, and after that the analog video feed collapsed whenever I flew it. Clean picture, then banding, then a washed-out white frame, then full snow, all inside five seconds.

Here is the collapse frame by frame, off a bench run with the props off.

![Eight frames from the DVR showing the video feed degrading from a stats screen through banding and washout into full static](/blog/fpv-onset-seq.jpg)

Three weeks later I fixed it by buying a new board, which is the least satisfying ending available and the one I should probably have reached in three days.

## Six of about fifteen wrong answers

The repair log runs to 3,200 lines and names roughly fifteen hypotheses. These six are the ones I believed hardest.

**1. A damaged camera power wire.** The first thing I wrote down, on day one, and I wrote it for the wrong reason. A wiggle test came back negative. Then six days later I resoldered the wire and the fault visibly changed, which I called the single most decisive result in the log, and then all three camera wires tested negative again and it went back in the bin.

**2. A cracked solder joint.** Prodding individual joints with a plastic pick. This one was genuinely reproducible, which is why it held on so long: pressing near the camera socket gave real breakup with slow recovery, every time. What it was reproducing was not what I thought.

**3. The camera is drawing too much current.** Unplug the camera entirely, run the throttle to full, and the carrier held clean all the way. Then the spec sheet seemed to seal it. The C03 camera is rated at 100mA and weighs 1.45 grams, and a 1.45 gram part drawing 100 milliamps cannot get hot. Mine was hot. So it was drawing far above spec, sitting on the shared 5V rail and holding it near the limit, and motor load tipped it over. I priced the US$12 replacement and moved on.

It came back.

**4. The flight controller is browning out.** Motor current sags the rail, the board resets, the video drops. I liked this one because it explained the throttle correlation, and because the evidence was strong: one battery insertion produced about ten separate blackbox sessions, which is nine power cycles. The board really was rebooting when I pressed on it.

**5. The board is cracked and the whole AIO needs replacing.** US$55. I talked myself out of it, went looking for other people with the symptom instead, and that search is what produced the only real lead in the whole file. Then I bought the board anyway a day later, and it was the fix. Both halves of that are true and I have made my peace with neither.

**6. The antenna socket has lifted off its pads.** That search turned up a review on BetaFPV's own product page: "a consistent point of failure is the VTX on the 5in1", and then, crucially, "the VTX connector coming off the board." A lifted U.FL socket explains flex sensitivity, explains why a bump changes the state, and is repairable with a soldering iron instead of a credit card. I never cleared it. I asked myself four separate times to press directly on the socket body and never once did it.

## The instrument was on the board the whole time

I had the quad on USB for a routine config dump and noticed `blackbox_device = SPIFLASH` and `current_meter = ADC` sitting near each other in the output. The board has a real current sensor and a 16MB flash chip. It can log voltage and amperage against throttle, by itself, in flight. I had spent the previous week writing notes that said "this needs a multimeter."

Getting the data off was its own problem. The flash was full and had to be erased, which is irreversible, so I read what was on it first. Then the USB socket turned flaky once the board was out of the airframe and started dropping the link within seconds, against a full dump that takes about three minutes over MSP. So I wrote `bbtail.py`: pull only the tail of the flash, write incrementally so a mid-transfer drop still leaves usable bytes on disk, resume from a byte offset. Wrapped in a retry loop it got the 3MB I had asked for across repeated disconnects.

Three sessions in that tail. Two of them on battery with the motors spinning, 63.6 seconds and 45.3 seconds, both unbroken, straight through the video breaking up.

No reboot in either. A brownout would have chopped those logs into pieces, the way the press test had. So whatever killed the video during a normal arm was not the board resetting, and hypothesis 4 stopped being the whole story.

I then overcorrected and wrote down that it was not power at all. That was too broad, and I caught it a day later: the 5V rail can collapse while the motors keep spinning and the flight controller keeps logging happily, because blackbox cannot see that rail. The log ruled out a whole-board reset. It did not rule out power.

The number in that log I nearly skimmed past: the feed broke up at 1.64 amps with the props off, motors barely idling. A healthy whoop shrugs off ten amp punches. There was no noise immunity left at all.

## Three weeks on a correlation that did not exist

Every hypothesis above starts from the same premise, stated in my own first sentence: the feed breaks up when I touch the throttle.

On 6 August I went back through the DVR recordings frame by frame, matching the breakup against the on-screen timer and arm state, and found an episode where the stats screen was visible at 57 seconds with snow running through the second before it. The stats screen only appears when the quad is disarmed.

The fault fires armed and disarmed. It is not arming, not throttle, not motors, not ESC switching, not current, not RPM. It also fires at 0.21 amps on a full pack, sitting still. The arm correlation was coincidence, because the quad was armed most of the time I was looking at it.

I had built three weeks of a 3,000 line file on top of it.

## The find that explained the one result I could not

There was one measurement I could not fit anywhere. I had changed the video transmit power by a factor of sixteen, 400mW down to 25mW, expecting the rail load to move the onset point. It moved nothing.

Three rounds of searching the symptom got me nothing but SEO farms. What worked was searching the board family alongside the symptom, and it turned up a post in the Air65/Air75 owners group about reviving BetaFPV 5in1 boards with collapsed video transmit power. The group is on Facebook and login walled, so I pulled the post text out of the page's JSON payload rather than the rendered DOM.

The symptom in the post: a "severe drop in output power" where "flying only a few meters away or behind a single wall causes complete static/snow", arriving "after a few crashes or being left plugged in on the bench for too long", cause given as "the power IC overheating, which leads to semiconductor breakdown."

And then the architecture, which is the part that mattered. The video transmitter is two chips. An RTC6705 generates the 5.8GHz carrier at 20 to 25 milliwatts, and a separate PA5542 amplifies it to 400.

<figure class="diagram">
<svg viewBox="0 0 880 250" role="img" aria-labelledby="vtxchain-t vtxchain-d" width="100%">
<title id="vtxchain-t">The video transmit chain described in the owners-group guide</title>
<desc id="vtxchain-d">The camera feeds an RTC6705 oscillator, which produces 20 to 25 milliwatts. That feeds a PA5542 power amplifier, which should produce 400 milliwatts, and which the guide identifies as the part that burns out. The power setting only addresses the oscillator, upstream of the amplifier.</desc>
<defs>
<marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
<path d="M0,0 L10,5 L0,10 z" fill="#707c9e"/>
</marker>
</defs>
<g font-family="ui-monospace, Menlo, Consolas, monospace" font-size="13">
<rect x="8" y="76" width="126" height="56" rx="7" fill="rgba(16,22,46,0.5)" stroke="rgba(164,184,245,0.28)"/>
<text x="71" y="100" fill="#f3f6ff" text-anchor="middle">C03 camera</text>
<text x="71" y="118" fill="#707c9e" text-anchor="middle" font-size="11">analog video</text>
<line x1="138" y1="104" x2="196" y2="104" stroke="#707c9e" marker-end="url(#ar)"/>
<rect x="200" y="76" width="168" height="56" rx="7" fill="rgba(16,22,46,0.5)" stroke="rgba(164,184,245,0.28)"/>
<text x="284" y="100" fill="#f3f6ff" text-anchor="middle">RTC6705</text>
<text x="284" y="118" fill="#76e4f4" text-anchor="middle" font-size="11">makes 5.8GHz at 25mW</text>
<line x1="372" y1="104" x2="430" y2="104" stroke="#707c9e" marker-end="url(#ar)"/>
<rect x="434" y="70" width="178" height="68" rx="7" fill="rgba(70,14,24,0.55)" stroke="#e0607a" stroke-dasharray="5 4"/>
<text x="523" y="94" fill="#ffd9e0" text-anchor="middle">PA5542</text>
<text x="523" y="112" fill="#e0607a" text-anchor="middle" font-size="11">should make 400mW</text>
<text x="523" y="129" fill="#e0607a" text-anchor="middle" font-size="11" font-weight="700">burns out</text>
<line x1="616" y1="104" x2="674" y2="104" stroke="#707c9e" marker-end="url(#ar)"/>
<rect x="678" y="76" width="126" height="56" rx="7" fill="rgba(16,22,46,0.5)" stroke="rgba(164,184,245,0.28)"/>
<text x="741" y="100" fill="#f3f6ff" text-anchor="middle">U.FL</text>
<text x="741" y="118" fill="#707c9e" text-anchor="middle" font-size="11">antenna</text>
<line x1="284" y1="60" x2="284" y2="30" stroke="rgba(164,184,245,0.35)"/>
<line x1="284" y1="30" x2="470" y2="30" stroke="rgba(164,184,245,0.35)"/>
<text x="284" y="22" fill="#b2bce2" font-size="11.5">the power setting only reaches this chip</text>
<text x="523" y="180" fill="#b2bce2" text-anchor="middle" font-size="11.5">with the amplifier dead, every setting leaves</text>
<text x="523" y="199" fill="#b2bce2" text-anchor="middle" font-size="11.5">the transmitter at the same feeble 25mW</text>
</g>
</svg>
<figcaption>From the owners-group guide, not from my board. I confirmed the oscillator by its 8MHz crystal and never did identify the amplifier.</figcaption>
</figure>

With the amplifier dead, the power setting is meaningless. The measurement that fit nothing was the fingerprint.

Everything else lines up under it. The antenna swap did nothing, the channel change did nothing, disabling SmartAudio did nothing, because none of them touch the amplifier. Full snow rather than graceful fade. Any motor merely plugged in wrecked it, because a healthy transmitter shrugs off coupling from 50mm motor leads and one with no margin left cannot. The transmitter chip ran hot, which is the failure still in progress.

The line I keep coming back to is "being left plugged in on the bench for too long", because that is a named cause and it is exactly what I had been doing to it for three weeks while I poked at it.

## What actually happened in the end

I bought the replacement board. It was configured and bound on 21 August and flew its maiden on 22 August, and everything was fine. Same motors, same camera, same antenna, same battery, same goggles, same field. Only the board changed and every symptom went with it.

So the board was the fault. The PA5542 story is still only the probable mechanism, because I never put a meter or a hot air gun on that chip, and the old board was never proven faulty in isolation. It is in a drawer as a rework candidate, which is where diagnoses go to be permanently almost-confirmed.

Three things I would tell myself on 22 July.

Verified present is not verified working. I ticked the bulk capacitor off as fine on 28 July, by eye, against a reference photo. A cracked ceramic capacitor looks perfect, passes a prod test, and is electrically open. That visual check retired a hypothesis for a full week.

Search the product family, not the symptom. Three rounds of generic symptom queries returned content farms. One query naming the board found an owner-written guide that matched every observation I had, including the one I could not explain.

Do not change two variables at once. When the board came out of the frame the motors came off with it, the feed went perfect, and I had no idea which of the two had done it. That is an entire extra test cycle bought with one careless move.

And a fourth I am less pleased about. Reasoning produced fifteen wrong answers over three weeks. What produced the right one was a stranger in a hobby group who had already hit it and written it up, and then a US$55 part.

## It flies now

![A frame from the drone's DVR, flying low over water beside a sandstone cutting with a derelict barge in the shot](/blog/fpv-flight.jpg)

That is from last week, down in a rock cutting by the water.

The feed still tears occasionally out at the far end, which is a different problem with a different antenna, and this time I am going to measure before I theorise.
