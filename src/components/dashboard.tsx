import React, {
  FunctionComponent,
  HTMLAttributes,
  useState,
  useEffect,
} from 'react';
import {
  Jumbotron,
} from 'reactstrap';

interface DashboardProps extends HTMLAttributes<HTMLElement> {
  startMatchDate: number;
  endMatchDate: number;
}

const Dashboard: FunctionComponent<DashboardProps> = ({
  startMatchDate,
  endMatchDate,
  ...rest
}) => {
  const [currentDate, setCurrentDate] = useState(Date.now());

  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentDate(Date.now());
    }, 1000);

    return (): void => clearInterval(timerId);
  }, []);

  const timeLeft = startMatchDate - currentDate > 0
    ? startMatchDate - currentDate
    : endMatchDate - currentDate;
  /** TODO: Better timer */
  const timeLeftLabel = `${Math.round((timeLeft / 1000 / 60 / 60 / 24 / 12) % 12)} months `
    + `${Math.round((timeLeft / 1000 / 60 / 60 / 24) % 30)} days `
    + `${(timeLeft / 1000 / 60 / 60) % 24 < 10 ? '0' : ''}${Math.round((timeLeft / 1000 / 60 / 60) % 24)}`
    + `:${(timeLeft / 1000 / 60) % 60 < 10 ? '0' : ''}${Math.round((timeLeft / 1000 / 60) % 60)}`
    + `:${(timeLeft / 1000) % 60 < 10 ? '0' : ''}${Math.round((timeLeft / 1000) % 60)}`;

  return (
    <div {...rest}>
      <Jumbotron color="black" className="text-center">
        {
          currentDate < startMatchDate && (
            <>
              <h1 className="display-3 text-center">The game hasn&apos;t been started yet</h1>
              <h1 className="display-4 text-center">
                {
                  `${timeLeftLabel} left.`
                }
              </h1>
              <p className="lead text-center">
                {`Game starts in: ${new Date(startMatchDate).toLocaleString()}`}
              </p>
            </>
          )
        }
        {
          startMatchDate <= currentDate
            && currentDate < endMatchDate
            && (
            <>
              <h1 className="display-3 text-center">The game started</h1>
              <h1 className="display-4 text-center">
                {
                  `${timeLeftLabel} left to finish.`
                }
              </h1>
              <p className="lead text-center">
                {
                  `Game finishes in: ${new Date(endMatchDate).toLocaleString()}`
                }
              </p>
            </>
            )
        }
        {
          currentDate >= endMatchDate
          && (
            <>
              <h1 className="display-3 text-center">The game is over</h1>
              <h1 className="display-4 text-center">
                Thanks everyone for taking a part in this game!
              </h1>
              <h3><a href="/scoreboard">View scoreboard!</a></h3>
            </>
          )
        }
      </Jumbotron>
    </div>
  );
};

export default Dashboard;
