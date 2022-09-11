import { createWriteStream } from 'fs';

import util from 'util';

const logFile = createWriteStream("./log_info.txt", { flags: 'a' });
export const log2File = (v: any) => {
    logFile.write(util.format(v) + '\n');
};