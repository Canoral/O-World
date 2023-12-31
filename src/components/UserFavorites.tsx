/* eslint-disable jsx-a11y/anchor-is-valid */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CountryFavorites } from '../@types/countryFavorites';
import { Flags } from '../@types/flags';
import { useAppDispatch, useAppSelector } from '../GlobalRedux/hooks';
import SimpleLoader from './SimpleLoader';
import {
  fetchFavoritesCountries,
  removeFavoriteCountry,
} from '../GlobalRedux/store/reducers/user';

interface UserFavoritesProps {
  favoritesCountries: CountryFavorites[];
  flags: Flags[];
}

/**
 * Component that displays the user's favorite countries.
 *
 * @param favoritesCountries The list of favorite countries.
 * @param flags The list of flag data.
 * @returns The component that renders the user's favorite countries.
 */
function UserFavorites({ favoritesCountries, flags }: UserFavoritesProps) {
  const dispatch = useAppDispatch();
  const [displayedCountries, setDisplayedCountries] = useState<number>(5);
  const [isViewAll, setIsViewAll] = useState<boolean>(false);
  const infiniteLoadingInfos = useAppSelector(
    (state) => state.user.infiniteLoading
  );

  if (infiniteLoadingInfos) {
    return <SimpleLoader />;
  }

  /**
   * Handles the click event to view more or less countries.
   *
   * @param event The click event.
   */
  const handleViewCountries = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    setIsViewAll(!isViewAll);
    if (!isViewAll) {
      setDisplayedCountries(favoritesCountries.length);
      return;
    }
    setDisplayedCountries(5);
  };

  /**
   * Finds the URL of the flag image for a given country.
   *
   * @param flagsList The list of flag data.
   * @param cca3 The cca3 code of the country.
   * @returns The URL of the flag image.
   */
  const findFlagUrl = (flagsList: Flags[], cca3: string) => {
    const flagData = flagsList.find((flag) => flag.cca3 === cca3);
    return flagData ? flagData.flags.png : '';
  };

  /**
   * Handles the removal of a country from favorites.
   *
   * @param countryId The ID of the country to be removed.
   */
  const handleRemoveFavorite = async (countryId: string) => {
    await dispatch(removeFavoriteCountry({ countryId }));
    await dispatch(fetchFavoritesCountries());
  };

  return (
    <div className="space-y-4 md:space-y-6 p-8 bg-base-100 rounded-lg shadow w-full">
      <div className="flex items-center justify-between mb-4 gap-6">
        <h5 className="text-xl font-bold leading-tight tracking-tight  md:text-2xl text-primary">
          Latest favorite countries
        </h5>

        {favoritesCountries &&
          favoritesCountries.length > 5 &&
          (!isViewAll ? (
            <a
              href="#"
              className="text-sm font-medium text-white hover:underline"
              onClick={handleViewCountries}
            >
              View all
            </a>
          ) : (
            <a
              href="#"
              className="text-sm font-medium text-white hover:underline"
              onClick={handleViewCountries}
            >
              View less
            </a>
          ))}
      </div>
      <div className="flow-root">
        {!favoritesCountries && (
          <div className="flex-1 min-w-0">
            <p className="font-medium text-white">No favorite countries yet</p>
          </div>
        )}
        <ul className="divide-y divide-primary">
          {favoritesCountries &&
            favoritesCountries.slice(0, displayedCountries).map((country) => {
              const flagUrl = findFlagUrl(flags, country.cca3);
              return (
                <li className="py-3 sm:py-4" key={country.cca3}>
                  <div className="flex items-center justify-between space-x-4">
                    <Link to={`/country/${country.cca3}`} className="block">
                      <div className="flex items-center px-6 font-medium">
                        <div className="object-contain">
                          <img
                            className="w-8 h-8 mr-4 object-cover rounded-md"
                            src={flagUrl}
                            alt="Country flag"
                          />
                        </div>

                        <div className="flex">
                          <p className="font-medium text-white">
                            {country.name}
                          </p>
                        </div>
                      </div>
                    </Link>
                    <div className="flex gap-16">
                      <p className="font-medium text-white">
                        Added on {country.date}
                      </p>

                      <button
                        type="button"
                        className="inline-block "
                        onClick={() => handleRemoveFavorite(country.cca3)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24" // Augmentez la valeur de width pour augmenter la taille
                          height="24" // Augmentez la valeur de height pour augmenter la taille
                          fill="currentColor"
                          className="bi bi-trash"
                          viewBox="0 0 16 16"
                        >
                          <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                          <path
                            fillRule="evenodd"
                            d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
        </ul>
      </div>
    </div>
  );
}

export default UserFavorites;
