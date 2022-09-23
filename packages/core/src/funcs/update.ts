import { Config, Database } from 'src/models';
import {
  Scoreboard,
  SolvedTask,
  ScoreboardUser,
  UnitId,
} from '../models/units';
import getFuncs from './get';

const release = (db: Database, config: Config) => ({
  scoreboard: async (): Promise<Scoreboard> => {
    // be sure that cached scoreboard exists
    const get = getFuncs(db);

    const [users, tasks] = await Promise.all([get.users(), get.tasks()]);

    const dashUsers: Scoreboard = {};

    users
      .map(({ name: userName, _id }) => {
        const solvedTasks: Record<UnitId, SolvedTask> = {};
        // sum of all points from completed tasks
        let points = 0;
        // sum of dates (used for sorting)
        let dateSum = 0;

        tasks.forEach((task) => {
          const dateSolved = task.solved[_id];
          const { length } = Object.keys(task.solved);

          // means that user has solved a task
          if (dateSolved) {
            const { name, _id: taskId, tags } = task;
            let taskPoints = task.points;

            if (config.dynamicPoints && config.minPoints) {
              taskPoints =
                config.minPoints +
                (taskPoints - config.minPoints) /
                  (1 + (Math.max(0, length - 1) / 11.92) ** 1.21);
            }

            solvedTasks[taskId] = {
              name,
              _id: taskId,
              tags: tags ?? [],
              points: taskPoints,
              date: dateSolved,
            };
            points += taskPoints;
            dateSum += dateSolved - (config.startMatchDate ?? 0);
          }
        });

        return {
          _id,
          name: userName,
          points,
          tasks: solvedTasks,
          dateSum,
        };
      })
      .sort((user1, user2) =>
        user2.points == user1.points
          ? user1.dateSum - user2.dateSum
          : user2.points - user1.points,
      )
      .forEach(({ dateSum, _id, ...userProps }, index) => {
        const user: ScoreboardUser = {
          ...userProps,
          _id,
          place: index,
        };

        dashUsers[_id] = user;
      });

    // be sure that scoreboard exists
    await get.cache();

    const datastore = db.cache;
    await datastore.update({}, { $set: { scoreboard: dashUsers } });

    return dashUsers;
  },
});

export default release;
