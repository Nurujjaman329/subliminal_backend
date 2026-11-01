import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  FlashSettings,
  FlashSettingsDocument,
} from './schemas/flash-settings.schema';

const DEFAULT_FLASH_SETTINGS = {
  key: 'global',
  position: {
    options: [
      { label: 'Centre', value: 'Centre', enabled: true, order: 0 },
      { label: 'Random', value: 'Random', enabled: true, order: 1 },
    ],
    defaultValue: 'Centre',
  },
  showEvery: {
    options: [
      { label: '3s', value: '3s', ms: 3000, enabled: true, order: 0 },
      { label: '5s', value: '5s', ms: 5000, enabled: true, order: 1 },
      { label: '10s', value: '10s', ms: 10000, enabled: true, order: 2 },
      { label: '15s', value: '15s', ms: 15000, enabled: true, order: 3 },
    ],
    defaultValue: '3s',
  },
  imageSize: {
    options: [
      { label: 'Small', value: 'Small', enabled: true, order: 0 },
      { label: 'Large', value: 'Large', enabled: true, order: 1 },
    ],
    defaultValue: 'Small',
  },
  sessionLength: {
    options: [
      { label: '30 m', value: '30 m', seconds: 1800, enabled: true, order: 0 },
      { label: '40 m', value: '40 m', seconds: 2400, enabled: true, order: 1 },
      { label: '60 m', value: '60 m', seconds: 3600, enabled: true, order: 2 },
      { label: 'Auto', value: 'Auto', seconds: null, enabled: true, order: 3 },
    ],
    defaultValue: 'Auto',
  },
  audioOptions: {
    options: [
      {
        label: 'Off',
        value: 'Off',
        mediaUrl: null,
        enabled: true,
        order: 0,
      },
      {
        label: 'Frequency',
        value: 'Frequency',
        mediaUrl: null,
        enabled: true,
        order: 1,
      },
      {
        label: 'Subliminal',
        value: 'Subliminal',
        mediaUrl: null,
        enabled: true,
        order: 2,
      },
    ],
    defaultValue: 'Frequency',
  },
  runOnStartUp: { enabled: false, defaultValue: false },
};

@Injectable()
export class FlashSettingsService {
  constructor(
    @InjectModel(FlashSettings.name)
    private readonly flashSettingsModel: Model<FlashSettingsDocument>,
  ) {}

  async getGlobal() {
    let doc = await this.flashSettingsModel.findOne({ key: 'global' }).exec();
    if (!doc) {
      doc = await this.flashSettingsModel.create(DEFAULT_FLASH_SETTINGS);
    }
    return doc;
  }
}
