import TemplaterPlugin from "main";
import { errorWrapperSync } from "utils/Error";
import { resolve_tfile } from "utils/Utils";

export class CommandHandler {
    constructor(private plugin: TemplaterPlugin) {}

    setup(): void {
        this.plugin.addCommand({
            id: "insert-templater",
            name: "Open insert template modal",
            icon: "templater-icon",
            hotkeys: [
                {
                    modifiers: ["Alt"],
                    key: "e",
                },
            ],
            callback: () => {
                this.plugin.fuzzy_suggester.insert_template();
            },
        });

        this.plugin.addCommand({
            id: "replace-in-file-templater",
            name: "Replace templates in the active file",
            icon: "templater-icon",
            hotkeys: [
                {
                    modifiers: ["Alt"],
                    key: "r",
                },
            ],
            callback: () => {
                this.plugin.templater.overwrite_active_file_commands();
            },
        });

        this.plugin.addCommand({
            id: "jump-to-next-cursor-location",
            name: "Jump to next cursor location",
            icon: "text-cursor",
            hotkeys: [
                {
                    modifiers: ["Alt"],
                    key: "Tab",
                },
            ],
            callback: () => {
                this.plugin.editor_handler.jump_to_next_cursor_location();
            },
        });

        this.plugin.addCommand({
            id: "create-new-note-from-template",
            name: "Create new note from template",
            icon: "templater-icon",
            hotkeys: [
                {
                    modifiers: ["Alt"],
                    key: "n",
                },
            ],
            callback: () => {
                this.plugin.fuzzy_suggester.create_new_note_from_template();
            },
        });

        this.register_templates_hotkeys();
    }

    register_templates_hotkeys(): void {
        this.plugin.settings.enabled_templates_hotkeys.forEach((template) => {
            if (template) {
                this.add_template_hotkey(null, template);
            }
        });
    }

    add_template_hotkey(
        old_template: string | null,
        new_template: string
    ): void {
        this.remove_template_hotkey(old_template);

        if (new_template) {
            this.plugin.addCommand({
                id: new_template,
                name: `Insert ${new_template}`,
                icon: "templater-icon",
                callback: () => {
                    const template = errorWrapperSync(
                        () => resolve_tfile(this.plugin.app, new_template),
                        `Couldn't find the template file associated with this hotkey`
                    );
                    if (!template) {
                        return;
                    }
                    this.plugin.templater.append_template_to_active_file(
                        template
                    );
                },
            });
            this.plugin.addCommand({
                id: `create-${new_template}`,
                name: `Create ${new_template}`,
                icon: "templater-icon",
                callback: () => {
                    const template = errorWrapperSync(
                        () => resolve_tfile(this.plugin.app, new_template),
                        `Couldn't find the template file associated with this hotkey`
                    );
                    if (!template) {
                        return;
                    }
                    this.plugin.templater.create_new_note_from_template(
                        template
                    );
                },
            });
        }
    }

    remove_template_hotkey(template: string | null): void {
        if (template) {
            this.plugin.removeCommand(
                `${this.plugin.manifest.id}:create-${template}`
            );
            this.plugin.removeCommand(`${this.plugin.manifest.id}:${template}`);
        }
    }
}
