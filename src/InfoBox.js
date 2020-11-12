import { Card, CardContent, Typography } from '@material-ui/core';
import React from 'react';
import './InfoBox.css'

function InfoBox({title, cases , total, clicked , isRed , active}) {
	return (
		<Card onClick={clicked} className={`infoBox ${active && "infoBox--selected"} ${
			isRed && "infoBox--red"
		  }`}>
			<CardContent>
				<Typography color="textSecondary" gutterBottom>
					{title}
				</Typography>
				<h2  className= {`infoBox__cases ${!isRed && "infoBox__cases--green"}`}>{cases}</h2>
				<Typography className="infoBox__total"color="textSecondary">
					{total} Total
				</Typography>
				
			</CardContent>
		</Card>
	);
}

export default InfoBox;
