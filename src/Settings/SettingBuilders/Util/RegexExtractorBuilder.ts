import SettingBuilderInterface, { BuildParams } from "@src/Settings/Interface/SettingBuilderInterface";
import { RegexExtractorSettings, SettingsType } from "@src/Settings/SettingsType";
import { ObjectItemInterface } from "@src/Storage/Interfaces";
import { injectable } from "inversify";
import { Setting } from "obsidian";
import { t } from "@src/i18n/Locale";

type RegexExtractorItem = ObjectItemInterface<SettingsType["regexExtractor"]>;

@injectable()
export default class RegexExtractorBuilder implements SettingBuilderInterface<SettingsType, "regexExtractor"> {
    build({ name, item, container }: BuildParams<SettingsType, "regexExtractor">): void {
        this.buildRegexExtractor(item as RegexExtractorItem, container);
    }

    support(k: keyof SettingsType): boolean {
        return k === "regexExtractor";
    }

    private buildRegexExtractor(item: RegexExtractorItem, container: HTMLElement): void {
        container.createEl("h4", { text: t("regexExtractor.title") });

        new Setting(container)
            .setName(t("regexExtractor.enabled.name"))
            .setDesc(t("regexExtractor.enabled.desc"))
            .addToggle(toggle => 
                toggle
                    .setValue(item.get("enabled").value())
                    .onChange(value => {
                        item.get("enabled").set(value);
                    })
            );

        new Setting(container)
            .setName(t("regexExtractor.pattern.name"))
            .setDesc(t("regexExtractor.pattern.desc"))
            .addText(text => 
                text
                    .setValue(item.get("pattern").value())
                    .onChange(value => {
                        item.get("pattern").set(value);
                    })
            );

        new Setting(container)
            .setName(t("regexExtractor.groupIndex.name"))
            .setDesc(t("regexExtractor.groupIndex.desc"))
            .addText(text => 
                text
                    .setValue(String(item.get("groupIndex").value()))
                    .onChange(value => {
                        const index = parseInt(value) || 0;
                        text.setValue(index.toString());
                        item.get("groupIndex").set(index);
                    })
            );

        new Setting(container)
            .setName(t("regexExtractor.priority.name"))
            .setDesc(t("regexExtractor.priority.desc"))
            .addDropdown(dropdown => 
                dropdown
                    .addOptions({
                        'before': t("regexExtractor.priority.options.before"),
                        'after': t("regexExtractor.priority.options.after")
                    })
                    .setValue(item.get("priority").value())
                    .onChange(value => {
                        item.get("priority").set(value as 'before' | 'after');
                    })
            );
    }
} 