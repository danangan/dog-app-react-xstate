import React from 'react';
import styles from './styles.module.scss';
// Source: https://loading.io/css/, thanks for the beautiful loader!

export function GenericLoader({className}) {
  return <div className={styles.ldsRipple}>
    <div className={className}/>
    <div className={className}/>
  </div>
}
