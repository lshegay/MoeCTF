import { Task } from '../models';
import { ScoreboardUser } from '../models/units';
import get from './get';

const scoreboard = async ({ db, config }): Promise<ScoreboardUser[]> => {
  // be sure that cached scoreboard exists
  await get.scoreboard({ db });

  const _users = await get.users({ db });
  const _tasks = await get.tasks({ db });

  const dashUsers: ScoreboardUser[] = _users
    .map(({ name, _id }) => {
      const solvedTasks: Partial<Task>[] = [];
      let points = 0;
      let dateSum = 0;

      _tasks.forEach((task) => {
        const dateSolved = task.solved[_id];
        const { length } = Object.keys(task.solved);

        if (dateSolved) {
          const { name, _id, categoryId } = task;
          let taskPoints = task.points;

          if (config.dynamicPoints) {
            taskPoints = config.minPoints + (taskPoints - config.minPoints)
              / (1 + (Math.max(0, length - 1) / 11.92) ** 1.21);
          }

          solvedTasks.push({
            name, _id, categoryId,
          });
          points += taskPoints;
          dateSum += dateSolved - (config.startMatchDate ?? 0);
        }
      });

      return ({
        name,
        points,
        tasks: solvedTasks,
        dateSum,
      });
    })
    .sort((user1, user2) => (
      user2.points == user1.points
        ? user1.dateSum - user2.dateSum
        : user2.points - user1.points
    ));

  return dashUsers;
};

export default {
  scoreboard,
};
