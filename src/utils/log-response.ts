import { type IngestResponseSuccess } from '../constants';

export function logResponse(response: IngestResponseSuccess, logger = console): void {
  const { res, info, reportUrl } = response;
  if (res?.job?.internalBuildNumber) {
    logger.info(`Job #${res.job.internalBuildNumber} done.`);
  }

  if (info?.message?.txt) {
    logger.info(info.message.txt);
  }

  if (reportUrl) {
    logger.info('View bundle report:', reportUrl);
  }
}
