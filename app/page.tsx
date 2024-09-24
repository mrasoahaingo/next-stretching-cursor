"use client";

import { gsap } from "gsap";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { vec2 } from "vecteur";

const CustomCursor = () => {
	const cursorRef = useRef(null);
	const menuBtnRef = useRef(null);
	const closeBtnRef = useRef(null);
	const [position, setPosition] = useState({
		previous: vec2(-100, -100),
		current: vec2(-100, -100),
		target: vec2(-100, -100),
		lerpAmount: 0.1,
	});
	const [scale, setScale] = useState({
		previous: 1,
		current: 1,
		target: 1,
		lerpAmount: 0.1,
	});
	const [isHovered, setIsHovered] = useState(false);
	const [hoverEl, setHoverEl] = useState<HTMLElement | null>(null);

	useEffect(() => {
		if (!cursorRef.current) return;

		const update = () => {
			const newPosition = { ...position };
			newPosition.current.lerp(newPosition.target, newPosition.lerpAmount);
			const newScale = gsap.utils.interpolate(
				scale.current,
				scale.target,
				scale.lerpAmount,
			);

			const delta = newPosition.current.clone().sub(newPosition.previous);

			newPosition.previous.copy(newPosition.current);
			setPosition(newPosition);
			setScale((prev) => ({ ...prev, current: newScale, previous: newScale }));

			gsap.set(cursorRef.current, {
				x: newPosition.current.x,
				y: newPosition.current.y,
			});

			if (!isHovered) {
				const angle = Math.atan2(delta.y, delta.x) * (180 / Math.PI);
				const distance =
					Math.sqrt(delta.x * delta.x + delta.y * delta.y) * 0.04;

				gsap.set(cursorRef.current, {
					rotate: angle,
					scaleX: newScale + Math.min(distance, 1),
					scaleY: newScale - Math.min(distance, 0.3),
				});
			}
		};

		const updateTargetPosition = (x: number, y: number) => {
			if (isHovered && hoverEl) {
				const bounds = hoverEl.getBoundingClientRect();

				const cx = bounds.x + bounds.width / 2;
				const cy = bounds.y + bounds.height / 2;

				const dx = x - cx;
				const dy = y - cy;

				setPosition((prev) => ({
					...prev,
					target: vec2(cx + dx * 0.15, cy + dy * 0.15),
				}));
				setScale((prev) => ({ ...prev, target: 2 }));

				const angle = Math.atan2(dy, dx) * (180 / Math.PI);
				const distance = Math.sqrt(dx * dx + dy * dy) * 0.01;

				gsap.set(cursorRef.current, { rotate: angle });
				gsap.to(cursorRef.current, {
					scaleX: 2 + Math.min(distance, 0.6) ** 3 * 3,
					scaleY: 2 - Math.min(distance, 0.3) ** 3 * 3,
					duration: 0.5,
					ease: "power4.out",
					overwrite: true,
				});
			} else {
				setPosition((prev) => ({
					...prev,
					target: vec2(x, y),
				}));
				setScale((prev) => ({ ...prev, target: 1 }));
			}
		};

		const onMouseMove = (event: { clientX: number; clientY: number }) => {
			const x = event.clientX;
			const y = event.clientY;
			updateTargetPosition(x, y);
		};

		gsap.ticker.add(update);
		window.addEventListener("pointermove", onMouseMove);

		return () => {
			gsap.ticker.remove(update);
			window.removeEventListener("pointermove", onMouseMove);
		};
	}, [position, scale, isHovered, hoverEl]);

	const handlePointerOver = (event: React.PointerEvent<HTMLButtonElement>) => {
		setIsHovered(true);
		setHoverEl(event.currentTarget);
	};

	const handlePointerOut = () => {
		setIsHovered(false);
		setHoverEl(null);
	};

	const handlePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
		const currentElement = event.currentTarget;
		const { clientX: cx, clientY: cy } = event;
		const { height, width, left, top } = currentElement.getBoundingClientRect();
		const x = cx - (left + width / 2);
		const y = cy - (top + height / 2);
		const xTo = gsap.quickTo(currentElement, "x", {
			duration: 1,
			ease: "elastic.out(1, 0.3)",
		});
		const yTo = gsap.quickTo(currentElement, "y", {
			duration: 1,
			ease: "elastic.out(1, 0.3)",
		});
		xTo(x * 0.2);
		yTo(y * 0.2);
	};

	const handlePointerOutMove = (event: React.PointerEvent<HTMLButtonElement>) => {
		const currentElement = event.currentTarget;
		const xTo = gsap.quickTo(currentElement, "x", {
			duration: 1,
			ease: "elastic.out(1, 0.3)",
		});
		const yTo = gsap.quickTo(currentElement, "y", {
			duration: 1,
			ease: "elastic.out(1, 0.3)",
		});
		xTo(0);
		yTo(0);
	};

	return (
		<div className="bg-[#f2f2f2] font-inter w-full h-full grid place-content-center">
			<main className="h-full">
				<div className="flex gap-24">
					<button
						className="btn menu-btn relative w-10 h-10 grid place-content-center"
						data-hover
						ref={menuBtnRef}
						type="button"
						onPointerOver={handlePointerOver}
						onPointerOut={handlePointerOut}
						onPointerMove={handlePointerMove}
						onPointerOutCapture={handlePointerOutMove}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							color="#000000"
						>
							<title>Menu</title>
							<line x1="4" x2="20" y1="12" y2="12" />
							<line x1="4" x2="20" y1="6" y2="6" />
							<line x1="4" x2="20" y1="18" y2="18" />
						</svg>
						<div
							data-hover-bounds
							className="absolute inset-0 hover:scale-[4] transition-transform"
						/>
					</button>

					<button
						className="btn close-btn relative w-10 h-10 grid place-content-center"
						data-hover
						ref={closeBtnRef}
						type="button"
						onPointerOver={handlePointerOver}
						onPointerOut={handlePointerOut}
						onPointerMove={handlePointerMove}
						onPointerOutCapture={handlePointerOutMove}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="lucide lucide-x"
							color="#000000"
						>
							<title>Close</title>
							<path d="M18 6 6 18" />
							<path d="m6 6 12 12" />
						</svg>
						<div
							data-hover-bounds
							className="absolute inset-0 hover:scale-[4] transition-transform"
						/>
					</button>
				</div>
			</main>

			<div
				ref={cursorRef}
				className="cursor w-6 h-6 rounded-full fixed left-0 top-0 -translate-x-1/2 -translate-y-1/2 bg-[#f2f2f2] mix-blend-difference pointer-events-none"
			/>
		</div>
	);
};

export default CustomCursor;
