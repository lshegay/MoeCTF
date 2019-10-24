import React from 'react';
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import fetch from 'isomorphic-fetch';
import moment from 'moment';

import User from '../src/interfaces/User';
import STask from '../src/interfaces/STask';
import PageProps from '../src/interfaces/props/PageProps';

import config from '../server/Config';

import '../styles/main.scss';

const { protocol, hostname, port } = config;
const host = hostname + (port ? `:${port}` : '');
const pageRequest = `${protocol}//${host}/api/admin/live`;


interface PageStates {
  tasks: STask[];
}

class Live extends React.PureComponent<PageProps, PageStates> {
  timer: NodeJS.Timeout;

  static async getInitialProps({ req }): Promise<PageProps> {
    const pageProps: PageProps = {
      user: req.user,
    };

    return pageProps;
  }

  constructor(props: PageProps) {
    super(props);

    this.state = {
      tasks: [],
    };
  }

  componentDidMount(): void {
    this.timer = setInterval(() => {
      const letsFetch = async (): Promise<void> => {
        const respond = await fetch(pageRequest, { method: 'POST' });
        const json = await respond.json();
        this.setState({
          tasks: json.stasks,
        });
      };

      letsFetch();
    }, 5000);
  }

  componentWillUnmount(): void {
    clearInterval(this.timer);
  }

  render(): JSX.Element {
    const { tasks } = this.state;
    const timelineElements = [];
    const users: User[] = [];
    const timeline: any[] = [];
    const firstEvent = { date: '0' };

    tasks.forEach((task) => {
      if (!users.find((currentUser) => (currentUser.id == task.userId))) {
        const user: User = {
          id: task.userId,
          name: task.userName,
        };
        users.push(user);

        firstEvent[`points${task.userId}`] = 0;
      }
    });

    timeline.push(firstEvent);

    tasks.forEach((task) => {
      if (task.points) {
        const event = { ...timeline[timeline.length - 1] };

        event.date = moment(task.date).format('YYYY MMMM DD HH:mm:ss');
        event[`points${task.userId}`] += task.points;

        timeline.push(event);
      }
    });

    users.forEach((currentUser, index) => {
      const colorArray = ['#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6',
        '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
        '#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A',
        '#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC',
        '#66994D', '#B366CC', '#4D8000', '#B33300', '#CC80CC',
        '#66664D', '#991AFF', '#E666FF', '#4DB3FF', '#1AB399',
        '#E666B3', '#33991A', '#CC9999', '#B3B31A', '#00E680',
        '#4D8066', '#809980', '#E6FF80', '#1AFF33', '#999933',
        '#FF3380', '#CCCC00', '#66E64D', '#4D80CC', '#9900B3',
        '#E64D66', '#4DB380', '#FF4D4D', '#99E6E6', '#6666FF'];

      timelineElements.push(
        <Line
          name={currentUser.name}
          key={currentUser.name}
          type="monotone"
          dataKey={`points${currentUser.id}`}
          stroke={colorArray[index % colorArray.length]}
          label
        />
      );
    });

    return (
      <div className="Live">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={timeline}>
            {timelineElements}
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Legend verticalAlign="top" height={36} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }
}

export default Live;
