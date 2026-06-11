import { tools } from "@/lib/data";
import { SectionHeader } from "@/components/SectionHeader";

function ToolTile({ tool }: { tool: (typeof tools)[number] }) {
  const Icon = tool.icon;

  return (
    <div className="tool-tile group">
      <span className="flex h-9 w-9 items-center justify-center">
        {Icon ? (
          <Icon className="h-8 w-8 transition group-hover:scale-110" style={{ color: tool.color }} />
        ) : (
          <span
            className="rounded-md border border-current px-1.5 py-1 text-xs font-black"
            style={{ color: tool.color }}
          >
            {tool.short}
          </span>
        )}
      </span>
      <span className="text-sm font-semibold text-white">{tool.name}</span>
    </div>
  );
}

export function ToolEcosystem() {
  const marqueeTools = [...tools, ...tools];

  return (
    <section id="tools" className="section-shell">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
        <SectionHeader
          title="TOOL ECOSYSTEM"
          copy="The tools and platforms I use to build, automate, and scale digital systems."
        />
        <div className="hidden overflow-hidden rounded-lg border border-[#262626] bg-[#101010]/82 p-5 lg:block">
          <div className="tool-marquee">
            {marqueeTools.map((tool, index) => (
              <ToolTile key={`${tool.name}-${index}`} tool={tool} />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 lg:hidden">
          {tools.slice(0, 18).map((tool) => (
            <ToolTile key={tool.name} tool={tool} />
          ))}
          <div className="tool-tile">
            <span className="text-sm font-semibold text-[#A3A3A3]">and more...</span>
          </div>
        </div>
      </div>
    </section>
  );
}
