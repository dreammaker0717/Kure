import { useState, forwardRef, useEffect, useRef } from 'react';
import defaultImage from 'assets/images/kure_lm_default_product_image.jpg';
import { Box } from '@mui/material';

/**
 * We load in two images, one is visible and carries the default product image, the other is hidden and carries the
 * product image. The hidden image is loaded in the background and when it is loaded, we hide the default image and
 * show the product image.
 */
const Image = forwardRef(({ index, className, src, alt, sx, ...props }, ref) => {
  const referenceDefaultImage = useRef(null);
  const referenceSrcImage = useRef(null);

  const _style = props.style ? props.style : {}
  if (!src || src == undefined || src == "") {
    return <Box sx={sx}>
      <img
        width="100%"
        height="100%"
        className={className}
        style={{ ..._style, objectFit: 'cover', display: "block" }}
        // ref={ref}
        alt={alt}
        {...props}
        src={defaultImage}
      />
    </Box>
  }
  return (
    <Box sx={sx}>
      <img
        ref={referenceDefaultImage}
        width="100%"
        height="100%"
        className={className}
        style={{ ..._style, objectFit: 'cover' }}
        // ref={ref}
        src={defaultImage}
        alt={alt}
        {...props}
        onLoad={() => {
          referenceDefaultImage.current.style.display = 'block';
          referenceSrcImage.current.style.display = 'none';
        }}
      />
      <img
        ref={referenceSrcImage}
        width="100%"
        height="100%"
        className={className}
        style={{ ..._style, display: 'none', objectFit: 'cover' }}
        // ref={ref}
        src={src}
        alt={alt}
        {...props}
        onLoad={() => {
          referenceDefaultImage.current.style.display = 'none';
          referenceSrcImage.current.style.display = 'block';
        }}
      />
    </Box>
  );
});

export default Image;
