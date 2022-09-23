import moment from 'moment';
import { Config, Database } from 'src/models';
import { User } from '../models/units';

const release = (_: Database, config: Config) => ({
  isNotEnded: (user?: User): boolean => {
    const currentDate = moment();
  
    if (!config.timer) return true;
    if (user?.admin) return true;
  
    const endMatchDate = moment(config.endMatchDate);
    if (config.endMatchDate && currentDate.isBefore(endMatchDate)) return true;
  
    return false;
  },
  isStarted: (user?: User): boolean => {
    const currentDate = moment();
  
    if (!config.timer) return true;
    if (user?.admin) return true;
  
    const startMatchDate = moment(config.startMatchDate);
    if (config.startMatchDate && currentDate.isSameOrAfter(startMatchDate)) return true;
  
    return false;
  }
});

export default release;
