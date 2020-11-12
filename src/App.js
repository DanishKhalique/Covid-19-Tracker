import { Card, CardContent, FormControl, MenuItem, Select } from '@material-ui/core';
import Axios from 'axios';
import React, { useEffect, useState } from 'react';
import './App.css';
import InfoBox from './InfoBox';
import LineGraph from './LineGraph';
import Table from './Table';
import { sortData, prettyPrintStat } from './util';
import numeral from 'numeral';
import Map from './Map';
import 'leaflet/dist/leaflet.css';

//https://disease.sh/v3/covid-19/countries

// data: Array(218)
// [0 … 99]
// 0:
// active: 5932
// activePerOneMillion: 151.18
// cases: 42463
// casesPerOneMillion: 1082
// continent: "Asia"
// country: "Afghanistan"
// countryInfo:
// flag: "https://disease.sh/assets/img/flags/af.png"
// iso2: "AF"
// iso3: "AFG"
// lat: 33
// long: 65
// _id: 4
// __proto__: Object
// critical: 93
// criticalPerOneMillion: 2.37
// deaths: 1577
// deathsPerOneMillion: 40
// oneCasePerPeople: 924
// oneDeathPerPeople: 24881
// oneTestPerPeople: 310
// population: 39237563
// recovered: 34954
// recoveredPerOneMillion: 890.83
// tests: 126735
// testsPerOneMillion: 3230
// todayCases: 166
// todayDeaths: 3
// todayRecovered: 233
// updated: 1605035982108

//https://disease.sh/v3/covid-19/all

// data:
// active: 14090301
// activePerOneMillion: 1809.69
// affectedCountries: 218
// cases: 51689920
// casesPerOneMillion: 6631
// critical: 94615
// criticalPerOneMillion: 12.15
// deaths: 1275952
// deathsPerOneMillion: 163.7
// oneCasePerPeople: 0
// oneDeathPerPeople: 0
// oneTestPerPeople: 0
// population: 7786015030
// recovered: 36323667
// recoveredPerOneMillion: 4665.24
// tests: 879809152
// testsPerOneMillion: 112998.65
// todayCases: 435180
// todayDeaths: 6962
// todayRecovered: 260420
// updated: 16050401

function App() {
	const [ countryName, setCountryName ] = useState('worldwide');
	const [ country, setCountry ] = useState([]);
	const [ specificCountry, setSpecificCountry ] = useState({});
	const [ tableData, setTableData ] = useState([]);
	useState([]);
	const [ casesType, setCasesType ] = useState('cases');
	const [ mapCountries, setMapCountries ] = useState([]);
	const [ mapCenter, setMapCenter ] = useState({ lat: 34.80746, lng: -40.4796 });
	const [ mapZoom, setMapZoom ] = useState(3);

	useEffect(() => {
		Axios('https://disease.sh/v3/covid-19/all')
			.then((res) => {
				//console.log(`world`, res.data)
				setSpecificCountry(res.data);
			})
			.catch((err) => {
				console.log(err);
			});
	}, []);

	useEffect(() => {
		const getCountriesData = async () => {
			await Axios('https://disease.sh/v3/covid-19/countries')
				.then((res) => {
					const storeCountryInfo = res.data.map((country) => ({
						name: country.country,
						value: country.countryInfo.iso2
					}));
					let sortedData = sortData(res.data);
					setTableData(sortedData);
					setCountry(storeCountryInfo);
					setMapCountries(res.data);
				})
				.catch((err) => {
					setCountry(err);
				});
		};
		getCountriesData();
	}, []);

	const onCountryChange = async (event) => {
		const countryCode = event.target.value;

		let url =
			countryName === 'worldwide'
				? 'https://disease.sh/v3/covid-19/all'
				: `https://disease.sh/v3/covid-19/countries/${countryCode}`;
		await Axios(url)
			.then((response) => {
				//console.log(`>>`, response.data);
				setSpecificCountry(response.data);
				setCountryName(countryCode);
				setMapCenter([ response.data.countryInfo.lat, response.data.countryInfo.long ]);
				setMapZoom(4);
			})
			.catch((err) => {
				setSpecificCountry(err);
			});
	};

	return (
		<div className="app">
			<div className="app__left">
				<div className="app__header">
					{/** TITLE*/}
					<h1>COVID-19 TRACKER</h1>
					{/** DROP DOWN SEARCH*/}
					<FormControl variant="outlined" className="app__dropdown">
						<Select variant="outlined" value={countryName} onChange={onCountryChange}>
							<MenuItem value="worldwide">Worldwide</MenuItem>
							{country.map((country) => (
								<MenuItem key={country.name} value={country.value}>
									{country.name}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</div>

				<div className="app__infobox">
					{/** 3 BOX MODEL*/}
					<InfoBox
						clicked={(e) => setCasesType('cases')}
						isRed
						active={casesType === 'cases'}
						title="Coronavirus Cases"
						cases={numeral(specificCountry.todayCases).format('0,0')}
						total={prettyPrintStat(specificCountry.cases)}
					/>

					<InfoBox
						clicked={(e) => setCasesType('recovered')}
						active={casesType === 'recovered'}
						title="Recovered"
						cases={numeral(specificCountry.todayRecovered).format('0,0')}
						total={prettyPrintStat(specificCountry.recovered)}
					/>

					<InfoBox
						clicked={(e) => setCasesType('deaths')}
						isRed
						active={casesType === 'deaths'}
						title="Deaths"
						cases={numeral(specificCountry.todayDeaths).format('0,0')}
						total={prettyPrintStat(specificCountry.deaths)}
					/>
				</div>

				{/** MAP*/}

				<Map countries={mapCountries} casesType={casesType} center={mapCenter} zoom={mapZoom} />
			</div>

			<Card className="app__right">
				<CardContent>
					<div className="app__information">
						<h3>
							<strong>Live Cases by Country</strong>
						</h3>
						{/** LIST DESCENDING ORDER*/}
						<Table countries={tableData} />

						{/** GRAPH*/}
						<h3>
							<strong>
								{specificCountry.country} New {casesType}
							</strong>
						</h3>
						<LineGraph className="app__graph" casesType={casesType} />
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

export default App;
