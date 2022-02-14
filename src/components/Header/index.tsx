/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import Image from 'next/image';
import Link from 'next/link';
import styles from './header.module.scss';

export default function Header() {
  return (
    <div className={styles.header}>
      <Link href="/" prefetch>
        <a>
          <Image src="/logo.svg" alt="logo" width={200} height={100} />
        </a>
      </Link>
    </div>
  );
}
