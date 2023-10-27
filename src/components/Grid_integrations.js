import React from 'react';
import Link from '@docusaurus/Link';
import "../css/grid.css"

import { RiExternalLinkLine } from 'react-icons/ri';

export const Grid = ({ className, columns, children }) => {
	return (
		// I really don't like hardcoding the `columns`, but I can't figure out how
		// to have PurgeCSS not purse the classes because they're created with
		// string concatenation.
		// https://tailwindcss.com/docs/optimizing-for-production#writing-purgeable-html
		<div
			className={`grid custom-grid`}
		>
			{children}
		</div>
	);
};

export const Box = ({ className, to, title, cta, image, children }) => {

	return (
		<custom-link>
			<Link
				to={to}
				className={` custom-element p-8  border-gray-500  rounded !no-underline `}
				style={{
					borderColor: className,
					boxShadow: "0 4px 10px #0000006D",
					backgroundColor: "white",
					display: "flex",
					flexDirection: 'column',
					alignItems: 'center',
					borderBottomWidth: "3px",
					aspectRatio: "1/1",
					maxHeight: "100%",
					justifyContent: "space-around",
					margin: "10px",
					borderRadius: "20px",
				}}
			>
				<custom-h7
					className={`h7 group-hover:text-green-light dark:group-hover:text-green-light`}


					style={{ textAlign: "center", fontSize: "12px", groupHover: "#00ab44" }}
				//marginBottom:"50px", 
				>
					{title}
				</custom-h7>
				<div
					style={{
						width: "60%",
						maxHeight: "60%",
						aspectRatio: "1/1",
						display: "flex",
						justifyContent: "center",
						alignItems: "center"
					}}
				>
					{children}
				</div>
			</Link>
		</custom-link>
	);
};

