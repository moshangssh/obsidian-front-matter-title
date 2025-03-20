import { injectable, inject, named } from 'inversify';
import SI from '@config/inversify.types';
import Storage from '@src/Storage/Storage';
import { SettingsType } from '@src/Settings/SettingsType';
import LoggerInterface from '@src/Components/Debug/LoggerInterface';

@injectable()
export default class RegexExtractor {
  constructor(
    @inject(SI['settings:storage']) private settings: Storage<SettingsType>,
    @inject(SI.logger) @named('regex-extractor') private logger: LoggerInterface
  ) {}

  /**
   * 从文件名中提取标题
   * @param filename 文件名（不含路径和扩展名）
   * @returns 提取的标题，如果无法提取则返回null
   */
  public extract(filename: string): string | null {
    if (!this.settings.get('regexExtractor').get('enabled').value()) {
      return null;
    }

    try {
      const pattern = this.settings.get('regexExtractor').get('pattern').value();
      const groupIndex = this.settings.get('regexExtractor').get('groupIndex').value();
      
      if (!pattern) {
        return null;
      }

      const regex = new RegExp(pattern);
      const match = regex.exec(filename);
      
      if (!match || !match[groupIndex]) {
        return null;
      }

      return match[groupIndex];
    } catch (error) {
      this.logger.warn('正则提取器错误:', error);
      return null;
    }
  }
} 