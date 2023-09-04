import { rem } from "@mantine/core";
import type { MantineThemeOverride } from "@mantine/core";
import { SelectItem } from "./SelectItem";

export const getSelectOverrides = (): MantineThemeOverride["components"] => ({
  Select: {
    defaultProps: {
      withinPortal: true,
      itemComponent: SelectItem,
      maxDropdownHeight: 512,
    },
    styles: theme => ({
      wrapper: {
        marginTop: theme.spacing.xs,
      },
      rightSection: {
        svg: {
          color: theme.colors.text[2],
          width: rem(16),
          height: rem(16),

          "&[data-chevron] path": {
            d: 'path("M 1.38 4.19 a 0.7 0.7 90 0 1 0.99 0 L 7.5 9.32 l 5.13 -5.13 a 0.7 0.7 90 1 1 0.99 0.99 l -5.63 5.63 a 0.7 0.7 90 0 1 -0.99 0 l -5.63 -5.63 a 0.7 0.7 90 0 1 0 -0.99 z")',
          },
          "&:not([data-chevron]) path": {
            d: 'path("M 4.25 3.25 a 0.7 0.7 90 0 0 -0.99 0.99 L 6.51 7.5 l -3.25 3.25 a 0.7 0.7 90 1 0 0.99 0.99 L 7.5 8.49 l 3.25 3.25 a 0.7 0.7 90 1 0 0.99 -0.99 L 8.49 7.5 l 3.25 -3.25 a 0.7 0.7 90 0 0 -0.99 -0.99 L 7.5 6.51 L 4.25 3.25 z")',
          },
        },
      },
      itemsWrapper: {
        padding: rem(12),
      },
      item: {
        color: theme.colors.text[2],
        fontSize: theme.fontSizes.md,
        fontWeight: 700,
        lineHeight: theme.lineHeight,
        padding: theme.spacing.sm,
        "&:hover:not([data-disabled]), &:focus": {
          color: theme.colors.brand[1],
          backgroundColor: theme.colors.bg[0],
        },
        "&[data-disabled]": {
          color: theme.colors.text[0],
        },
      },
      separator: {
        padding: `0 ${theme.spacing.sm}`,

        "&:not(:first-of-type)": {
          "&::before": {
            content: '""',
            display: "block",
            marginTop: rem(6),
            marginBottom: rem(7),
            borderTop: `1px solid ${theme.colors.border[0]}`,
          },
        },
      },
      separatorLabel: {
        color: theme.colors.text[0],
        fontSize: theme.fontSizes.sm,
        fontWeight: "bold",
        lineHeight: theme.lineHeight,
        marginTop: rem(2),
        marginBottom: rem(2),
        paddingTop: rem(2),
        paddingBottom: rem(2),

        "&::after": {
          display: "none",
        },
      },
    }),
  },
});
