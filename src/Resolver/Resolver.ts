import { ResolverDynamicInterface } from "@src/Resolver/Interfaces";
import { inject, injectable, multiInject } from "inversify";
import SI from "../../config/inversify.types";
import FilterInterface from "../Interfaces/FilterInterface";
import EventDispatcherInterface from "../Components/EventDispatcher/Interfaces/EventDispatcherInterface";
import { ResolverEvents } from "./ResolverType";
import Event from "../Components/EventDispatcher/Event";
import { CreatorInterface } from "@src/Creator/Interfaces";
import RegexExtractor from "./RegexExtractor";
import { App, TFile } from "obsidian";
import Storage from "@src/Storage/Storage";
import { SettingsType } from "@src/Settings/SettingsType";

@injectable()
export class Resolver implements ResolverDynamicInterface {
    private template = "";

    constructor(
        @multiInject(SI.filter)
        private filters: FilterInterface[],
        @inject(SI["creator:creator"])
        private creator: CreatorInterface,
        @inject(SI["event:dispatcher"])
        private dispatcher: EventDispatcherInterface<ResolverEvents>,
        @inject(RegexExtractor) 
        private regexExtractor: RegexExtractor,
        @inject(SI["obsidian:app"]) 
        private app: App,
        @inject(SI["settings:storage"]) 
        private settings: Storage<SettingsType>
    ) {}

    setTemplate(template: string): void {
        this.template = template;
    }

    resolve(path: string): string | null {
        if (!this.valid(path)) {
            return null;
        }

        // 获取文件对象
        const file = this.app.vault.getAbstractFileByPath(path);
        if (!(file instanceof TFile)) {
            return null;
        }
        
        const filename = file.basename;
        const priority = this.settings.get('regexExtractor').get('priority').value();
        
        // 根据优先级决定尝试顺序
        if (priority === 'before') {
            // 先尝试正则提取
            const regexTitle = this.regexExtractor.extract(filename);
            if (regexTitle) {
                return this.dispatch(regexTitle, path);
            }
            
            // 再尝试原有的提取方法
            return this.get(path);
        } else {
            // 先尝试原有的提取方法
            const originalTitle = this.get(path);
            if (originalTitle) {
                return originalTitle;
            }
            
            // 如果原有方法提取失败，则尝试正则提取
            const regexTitle = this.regexExtractor.extract(filename);
            if (regexTitle) {
                return this.dispatch(regexTitle, path);
            }
        }
        
        return null;
    }

    private get(path: string): string | null {
        try {
            return this.dispatch(this.creator.create(path, this.template), path) ?? null;
        } catch (e) {
            console.error(`Error by path ${path}`, e);
        }

        return null;
    }

    private dispatch(title: string | null, path: string): string | null {
        const event = new Event<ResolverEvents["resolver:resolved"]>({
            value: title,
            modify(v: string) {
                this.value = v;
            },
            path: path,
        });
        this.dispatcher.dispatch("resolver:resolved", event);
        return event.get().value ?? null;
    }

    private valid(path: string): boolean {
        for (const filter of this.filters) {
            if (filter.check(path) === false) {
                return false;
            }
        }
        return true;
    }
}
