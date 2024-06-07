import { slugifyStr } from "@utils/slugify";
import Datetime from "./Datetime";
import type { CollectionEntry } from "astro:content";

export interface Props {
  href?: string;
  frontmatter: CollectionEntry<"blog">["data"];
  secHeading?: boolean;
}

export default function Card({ href, frontmatter, secHeading = true }: Props) {
  const { title, pubDatetime, modDatetime, description, ogImage, tags, readingTime } = frontmatter;

  // Extract the src string if ogImage is an object
  const imageSrc = typeof ogImage === "string" ? ogImage : ogImage?.src;

  const headerProps = {
    style: { viewTransitionName: slugifyStr(title) },
    className: "text-lg font-semibold decoration-dashed hover:underline",
  };

  return (
    <li className="my-8 mx-auto max-w-3xl sm:max-w-6xl">
      <a
        href={href}
        className="block transform overflow-hidden rounded-lg border shadow-md transition duration-300 ease-in-out hover:scale-105 hover:shadow-lg md:flex motion-safe:hover:scale-105 motion-safe:transition-transform"
      >
        <img src={imageSrc} alt="" className="h-48 w-full object-cover md:h-auto md:w-48" />
        <div className="p-4 md:flex-1">
          {secHeading ? <h2 {...headerProps}>{title}</h2> : <h3 {...headerProps}>{title}</h3>}
          <p className="hidden md:block mt-2 text-green-600 dark:text-pink-600">{description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.map(tag => (
              <span key={tag} className="bg-gray-100 text-gray-800 rounded-full px-3 py-1 text-sm font-medium">
                {tag}
              </span>
            ))}
          </div>
          <Datetime pubDatetime={pubDatetime} modDatetime={modDatetime} readingTime={readingTime} />
        </div>
      </a>
    </li>
  );
}
