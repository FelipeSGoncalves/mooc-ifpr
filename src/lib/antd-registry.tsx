"use client";

import React, { PropsWithChildren } from "react";
import { useServerInsertedHTML } from "next/navigation";
import { createCache, extractStyle, StyleProvider } from "@ant-design/cssinjs";

/**
 * Este componente é client-side, mas usa o hook `useServerInsertedHTML`
 * para injetar os estilos renderizados no servidor — o jeito oficial do Ant Design.
 */
export default function AntdRegistry({ children }: PropsWithChildren) {
  const cache = React.useMemo(() => createCache(), []);

  useServerInsertedHTML(() => {
    return (
      <style
        id="antd"
        dangerouslySetInnerHTML={{ __html: extractStyle(cache, true) }}
      />
    );
  });

  return <StyleProvider cache={cache}>{children}</StyleProvider>;
}
