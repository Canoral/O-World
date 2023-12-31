/* eslint-disable no-nested-ternary */

import { useMediaQuery } from 'react-responsive';
import { useNavigate } from 'react-router-dom';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Selection } from 'd3';
import { useAppSelector } from '../GlobalRedux/hooks';
import { CountryFavorites } from '../@types/countryFavorites';

interface CountryProperties {
  name: string;
}

interface CountryFeature {
  properties: CountryProperties;
  id: string;
  favorite: boolean;
}

interface Props {
  favoritesCountries: CountryFavorites[];
  isLogged: boolean;
}

/**
 * WorldMap component, displays a world map with countries that can be marked as favorites.
 * @param {Props} props - Properties for the WorldMap component.
 */
function WorldMap({ favoritesCountries, isLogged }: Props) {
  const navigate = useNavigate();
  const chartRef = useRef<any>(null);
  const [countryName, setCountryName] = useState<string>('');
  const [searchText, setSearchText] = useState<string>('');
  const worldWidth = useAppSelector((state) => state.home.currentWidth);
  const isSideBarOpen = useAppSelector((state) => state.home.sideBar);
  const isLargeScreen = useMediaQuery({ minWidth: 1024 });

  let countries: Selection<
    SVGPathElement,
    CountryFeature,
    SVGSVGElement,
    unknown
  >;

  /**
   * Effect that triggers on component mount.
   * Handles the rendering of the map and user interactions.
   */
  useEffect(() => {
    const scale = isLargeScreen ? 350 : 150;
    const width = isLargeScreen ? 800 : 400;
    const height = isLargeScreen ? 800 : 400;

    // Map projection
    const projection = d3
      .geoOrthographic()
      .scale(scale)
      .translate([width / 2, height / 2])
      .clipAngle(90)
      .precision(0.1)
      .rotate([0, 0, 0]);

    // map path
    const path = d3.geoPath().projection(projection);

    // Creating the SVG
    const svg = d3
      .select(chartRef.current)
      .append('svg')
      .attr('id', 'world')
      .attr('width', width)
      .attr('height', height);

    // Adding the grid
    const graticule = d3.geoGraticule();
    svg
      .append('path')
      .datum(graticule())
      .attr('class', 'graticule')
      .attr('d', path);

    // Adding countries
    d3.json('/world-countries.json').then((collection: any) => {
      const filteredCollection = collection.features.map(
        (feature: CountryFeature) => {
          const isFavorite =
            favoritesCountries &&
            favoritesCountries.some((favorite) => favorite.cca3 === feature.id);
          const favorite = isFavorite && isLogged; // Marquer comme favori uniquement si l'utilisateur est connecté
          return {
            ...feature,
            favorite,
          };
        }
      );

      // Adding attributes for countries
      countries = svg
        .selectAll<SVGPathElement, CountryFeature>('path.country')
        .data<CountryFeature>(filteredCollection)
        .enter()
        .append('path')
        .attr('d', (d: any) => path(d))
        .attr('class', 'country')
        .attr('id', (d: any) => d.id)
        .attr('fill', (d: any) => (d.favorite ? ' #828df8' : 'white'))
        .attr('stroke', 'gray')
        .attr('stroke-width', '.5px')
        .style('cursor', 'pointer')
        .on('mouseover', function (event: MouseEvent, d: any) {
          // // Handle mouse events
          if (d.favorite) {
            d3.select(this).style('fill', ' #606ff6'); // Different color for favorite countries when hovering
          } else {
            d3.select(this).style('fill', '#3abff8');
          }
          setCountryName(d.properties.name);
        })

        .on('mouseout', function (event: MouseEvent, d: any) {
          // // Handle mouse events
          d3.select(this).style('fill', ''); // Return to original color
          setCountryName(''); // Removal of country name
        })
        .on('click', function (d) {
          // // Handle mouse events
          clickHandler(d);
        });
      const clickHandler = (d: React.MouseEvent<HTMLElement> | any) => {
        navigate(`/country/${d.target.__data__.id}`); // Redirect to country page
      };
    });

    // Search management
    const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
      const query = event.target.value.toLowerCase(); // Search value retrieval
      setSearchText(query); // Status update

      if (!countries) {
        return; // countries is not available, exit the function
      }

      countries.style('fill', ''); // Reset color

      const matchedCountry: any = countries // Search for the corresponding country
        .data()
        .find((d: any) => d.properties.name.toLowerCase().includes(query));

      if (matchedCountry) {
        // If a country matches
        d3.select(`#${matchedCountry.id}`).style('fill', '#0ff');

        const centroid = d3.geoCentroid(matchedCountry); // Centering the map on the country
        projection.rotate([-centroid[0], -centroid[1]]);
        svg.selectAll('.graticule').datum(graticule()).attr('d', path);
        svg.selectAll('.country').attr('d', (d: any) => path(d));

        setCountryName(matchedCountry.properties.name); // Country name update
      } else {
        setCountryName(''); // Removal of country name
      }
    };

    chartRef.current.handleSearchChange = handleSearchChange; // Added the function to the chartRef object

    // Gestion du drag
    const lambda = d3.scaleLinear().domain([0, width]).range([-180, 180]);
    const phi = d3.scaleLinear().domain([0, height]).range([90, -90]);
    const drag = d3
      .drag<SVGSVGElement, any>()
      .subject(() => {
        const r = projection.rotate();
        return {
          x: lambda.invert(r[0]),
          y: phi.invert(r[1]),
        };
      })
      .on('drag', (event) => {
        projection.rotate([lambda(event.x), phi(event.y)]);
        svg.selectAll('.graticule').datum(graticule()).attr('d', path);
        svg.selectAll('.country').attr('d', (d: any) => path(d));
      });

    svg.call(drag as any);

    return () => {
      svg.remove();
    };
  }, [favoritesCountries, isLogged]);

  return (
    <div
      className="z-[1] items-center p-4 grid justify-center"
      style={
        isSideBarOpen
          ? isLargeScreen
            ? { width: worldWidth, float: 'right' }
            : { width: '100%', float: 'none' }
          : {}
      }
    >
      <div ref={chartRef} className="flex flex-col items-center">
        <h1 className="alien-font text-center font-extrabold text-xl md:text-3xl tracking-wider shadow-neon">
          {countryName || 'Click on a country'}
        </h1>
        <h2 className="orbitron-font text-center text-xl md:text-2xl font-bold mb-2">
          {countryName || 'Click on a country'}
        </h2>
        <input
          type="text"
          placeholder="Search..."
          value={searchText}
          onChange={(event) => chartRef.current.handleSearchChange(event)}
          className="orbitron-font input input-bordered input-info input-sm max-w-sm bg-transparent md:w-full"
        />
        <p className="orbitron-font italic text-[10px] md:text-sm text-neutral-content">
          Type the name of the country if you don't know where it is
        </p>
      </div>
    </div>
  );
}

export default WorldMap;
