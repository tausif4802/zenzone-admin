'use client';

import { useEffect, useState } from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

export default function ApiDocs() {
  const [spec, setSpec] = useState(null);

  useEffect(() => {
    fetch('/api/docs')
      .then((response) => response.json())
      .then((data) => setSpec(data))
      .catch((error) => console.error('Error loading API docs:', error));
  }, []);

  if (!spec) {
    return <div>Loading API documentation...</div>;
  }

  return (
    <div className="swagger-container">
      <SwaggerUI spec={spec} />
      <style jsx global>{`
        .swagger-container {
          padding: 1rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        .swagger-ui .info .title {
          color: #2c5282;
        }
        .swagger-ui {
          font-family: system-ui, -apple-system, sans-serif;
        }
      `}</style>
    </div>
  );
}
