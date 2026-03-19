"use client"

import { Languages } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLanguage } from "@/components/providers/language-provider"

export function LanguageSwitcher() {
    const { language, setLanguage, t } = useLanguage()

    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon-sm" className="sm:size-9">
                    <Languages className="h-[1rem] w-[1rem] sm:h-[1.2rem] sm:w-[1.2rem]" />
                    <span className="sr-only">{t('common.language.toggle')}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem
                    onClick={() => setLanguage("en")}
                    className={language === "en" ? "bg-accent" : ""}
                >
                    {t('common.language.english')}
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => setLanguage("id")}
                    className={language === "id" ? "bg-accent" : ""}
                >
                    {t('common.language.indonesian')}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
