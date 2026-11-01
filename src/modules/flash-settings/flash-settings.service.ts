import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  FlashSettings,
  FlashSettingsDocument,
} from './schemas/flash-settings.schema';
import { UpdateFlashSettingsDto } from './dto/update-flash-settings.dto';

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

type OptionLike = {
  label: string;
  value: string;
  enabled?: boolean;
  order?: number;
  ms?: number;
  seconds?: number | null;
  mediaUrl?: string | null;
};

type GroupLike = {
  options: OptionLike[];
  defaultValue: string;
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

  /** Admin: update global options and/or defaults */
  async updateGlobal(adminId: string, dto: UpdateFlashSettingsDto) {
    const doc = await this.getGlobal();

    if (dto.defaults) {
      if (dto.defaults.position !== undefined) {
        this.assertDefaultInOptions(doc.position, dto.defaults.position, 'position');
        doc.position.defaultValue = dto.defaults.position;
      }
      if (dto.defaults.showEvery !== undefined) {
        this.assertDefaultInOptions(
          doc.showEvery,
          dto.defaults.showEvery,
          'showEvery',
        );
        doc.showEvery.defaultValue = dto.defaults.showEvery;
      }
      if (dto.defaults.imageSize !== undefined) {
        this.assertDefaultInOptions(
          doc.imageSize,
          dto.defaults.imageSize,
          'imageSize',
        );
        doc.imageSize.defaultValue = dto.defaults.imageSize;
      }
      if (dto.defaults.sessionLength !== undefined) {
        this.assertDefaultInOptions(
          doc.sessionLength,
          dto.defaults.sessionLength,
          'sessionLength',
        );
        doc.sessionLength.defaultValue = dto.defaults.sessionLength;
      }
      if (dto.defaults.audio !== undefined) {
        this.assertDefaultInOptions(
          doc.audioOptions,
          dto.defaults.audio,
          'audioOptions',
        );
        doc.audioOptions.defaultValue = dto.defaults.audio;
      }
    }

    this.applyGroupPatch(doc.position, dto.position, 'position');
    this.applyGroupPatch(doc.showEvery, dto.showEvery, 'showEvery');
    this.applyGroupPatch(doc.imageSize, dto.imageSize, 'imageSize');
    this.applyGroupPatch(doc.sessionLength, dto.sessionLength, 'sessionLength');
    this.applyGroupPatch(doc.audioOptions, dto.audioOptions, 'audioOptions');

    if (dto.runOnStartUp) {
      if (dto.runOnStartUp.enabled !== undefined) {
        doc.runOnStartUp.enabled = dto.runOnStartUp.enabled;
      }
      if (dto.runOnStartUp.defaultValue !== undefined) {
        doc.runOnStartUp.defaultValue = dto.runOnStartUp.defaultValue;
      }
    }

    doc.updatedBy = new Types.ObjectId(adminId);
    doc.markModified('position');
    doc.markModified('showEvery');
    doc.markModified('imageSize');
    doc.markModified('sessionLength');
    doc.markModified('audioOptions');
    doc.markModified('runOnStartUp');

    await doc.save();
    return doc;
  }

  private applyGroupPatch(
    group: GroupLike,
    patch: { options?: OptionLike[]; defaultValue?: string } | undefined,
    field: string,
  ) {
    if (!patch) return;

    if (patch.options) {
      if (!patch.options.length) {
        throw new BadRequestException(`${field}.options must not be empty`);
      }
      group.options = patch.options.map((o, index) => ({
        label: o.label,
        value: o.value,
        enabled: o.enabled !== false,
        order: o.order ?? index,
        ...(o.ms !== undefined ? { ms: o.ms } : {}),
        ...(o.seconds !== undefined ? { seconds: o.seconds } : {}),
        ...(o.mediaUrl !== undefined ? { mediaUrl: o.mediaUrl } : {}),
      }));
    }

    if (patch.defaultValue !== undefined) {
      this.assertDefaultInOptions(group, patch.defaultValue, field);
      group.defaultValue = patch.defaultValue;
    } else if (patch.options) {
      const stillValid = group.options.some(
        (o) => o.value === group.defaultValue && o.enabled !== false,
      );
      if (!stillValid) {
        const first = group.options.find((o) => o.enabled !== false);
        if (!first) {
          throw new BadRequestException(
            `${field} must have at least one enabled option`,
          );
        }
        group.defaultValue = first.value;
      }
    }
  }

  private assertDefaultInOptions(
    group: GroupLike,
    value: string,
    field: string,
  ) {
    const ok = group.options.some(
      (o) => o.value === value && o.enabled !== false,
    );
    if (!ok) {
      throw new BadRequestException(
        `Invalid ${field} default "${value}" — not an enabled option`,
      );
    }
  }
}
